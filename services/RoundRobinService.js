import mongoose from "mongoose";
import User from "../models/user.model.js";
import RoundRobinState from "../models/RoundRobinState.js";

class RoundRobinService {
  /**
   * Get the next user for assignment based on the provided context (e.g., a specific form config or global).
   * @param {string} organization 
   * @param {string} context 
   * @param {Array} candidateIds - Optional: restrict rotation to these user IDs
   */
  async getNextUser(organization, context = "global", candidateIds = null) {
    try {
      console.log(`[RoundRobin] Context: ${context}, Organization: ${organization}, CandidateCount: ${candidateIds?.length || 0}`);
      let eligibleUsers;

      if (candidateIds && candidateIds.length > 0) {
        // Prepare IDs for rotation, supporting both String and ObjectId
        const processedIds = candidateIds.map(id => {
          if (mongoose.Types.ObjectId.isValid(id)) {
            return [id, new mongoose.Types.ObjectId(id)];
          }
          return [id];
        }).flat();

        // Rotation among specific people (from LeadCaptureConfig)
        eligibleUsers = await User.find({
          _id: { $in: processedIds },
          isActive: { $ne: false }
        }).sort({ createdAt: 1 });
      } else {
        // Global rotation (all active executives)
        eligibleUsers = await User.find({
          organization,
          role: { $in: ["Executive", "Sales", "Admin", "executive", "sales", "admin"] },
          isActive: { $ne: false }
        }).sort({ createdAt: 1 });
      }

      console.log(`[RoundRobin] Found ${eligibleUsers?.length || 0} eligible users`);
      if (!eligibleUsers || eligibleUsers.length === 0) {
        return null;
      }

      // Atomic increment of the index for this context
      const state = await RoundRobinState.findOneAndUpdate(
        { organization, context },
        { $inc: { last_assigned_index: 1 } },
        { upsert: true, new: true }
      );

      const nextIndex = state.last_assigned_index % eligibleUsers.length;
      return eligibleUsers[nextIndex];
    } catch (error) {
      console.error("Round-Robin Error:", error);
      return null;
    }
  }
}

export default new RoundRobinService();
