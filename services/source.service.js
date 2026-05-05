import Source from "../models/source.model.js";

class SourceService {
  async getAllSources() {
    return Source.find({ status: "active" }).sort({ name: 1 });
  }

  async createSource(data) {
    return Source.create(data);
  }

  async seedSources() {
    const defaultSources = [
      "Google Ads",
      "Facebook Ads",
      "Instagram",
      "Direct Referral",
      "Offline Marketing",
      "WhatsApp",
    ];

    for (const name of defaultSources) {
      await Source.findOneAndUpdate(
        { name },
        { name, status: "active" },
        { upsert: true, new: true }
      );
    }
    return { message: "Sources seeded successfully" };
  }
}

export const sourceService = new SourceService();
