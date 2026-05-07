import mongoose from "mongoose";
import User from "../models/user.model.js";
import RoundRobinState from "../models/RoundRobinState.js";

class RoundRobinService {
  /**
   * Get the next user for assignment based on the provided context (e.g., a specific form config or global).
   * @param {string} context 
   * @param {Array} candidateIds - Optional: restrict rotation to these user IDs
   */
  async getNextUser(context = "global", candidateIds = null) {
    try {
      console.log(`[RoundRobin] Context: ${context}, CandidateCount: ${candidateIds?.length || 0}`);
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
        // Global rotation: Find ALL active users regardless of role to ensure no one is missed
        eligibleUsers = await User.find({
          isActive: { $ne: false }
        }).sort({ createdAt: 1 });
      }

      // DEBUG: Log every single user found to see why someone might be missing
      console.log(`[RoundRobin] Total users in DB query: ${eligibleUsers.length}`);
      eligibleUsers.forEach((u, i) => {
        console.log(`  ${i}: ID=${u._id}, Name=${u.name}, Role=${u.role}, Active=${u.isActive}`);
      });

      const foundNames = eligibleUsers.map(u => u.name || "Unnamed").join(", ");
      console.log(`[RoundRobin] Eligible names: [${foundNames}]`);
      if (!eligibleUsers || eligibleUsers.length === 0) {
        return null;
      }

      // Atomic increment of the index for this context
      const state = await RoundRobinState.findOneAndUpdate(
        { context },
        { $inc: { last_assigned_index: 1 } },
        { upsert: true, new: true }
      );

      const nextIndex = state.last_assigned_index % eligibleUsers.length;
      const assignedUser = eligibleUsers[nextIndex];
      console.log(`[RoundRobin] Assigning index ${nextIndex} (Total: ${eligibleUsers.length}). User: ${assignedUser.name}`);
      return assignedUser;
    } catch (error) {
      console.error("Round-Robin Error:", error);
      return null;
    }
  }
}

export default new RoundRobinService();
