import Project from "../models/project.model.js";
import { AppError } from "../middleware/errorHandler.js";
import { moveToProjectFolder } from "../middleware/upload.js";

class ProjectService {
  /**
   * Create a new project with auto-incremented product_id.
   * Handles moving temp-uploaded images to the final project folder.
   */
  async addProject(data, tempFilePaths = []) {
    const { name, organization } = data;

    // 1. Duplicate check (case-insensitive)
    const existing = await Project.findOne({
      organization,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      status: "active",
    });

    if (existing) {
      throw new AppError(`Project "${name}" already exists in this organization`, 409);
    }

    // 2. Auto-generate product_id
    const lastProject = await Project.findOne({ organization })
      .sort({ product_id: -1 })
      .select("product_id");

    data.product_id = lastProject ? lastProject.product_id + 1 : 1001;
    data.property = "plots";

    // 3. Move uploaded images to project folder
    if (tempFilePaths.length > 0) {
      data.layoutImages = moveToProjectFolder(tempFilePaths, name);
    }

    // 4. Parse phases if they came as a JSON string (from FormData)
    if (typeof data.phases === "string") {
      data.phases = JSON.parse(data.phases);
    }

    // 5. Create project
    const project = await Project.create(data);
    return project;
  }

  /**
   * Get all active projects with summary stats via aggregation.
   * Counts total plots and booked plots across all phases.
   */
  async getAllProjects(organization) {
    return Project.aggregate([
      { $match: { organization, status: "active" } },
      {
        $project: {
          product_id: 1,
          name: 1,
          location: 1,
          property: 1,
          layoutImages: 1,
          createdAt: 1,
          phaseCount: { $size: { $ifNull: ["$phases", []] } },
          totalPlots: {
            $reduce: {
              input: { $ifNull: ["$phases", []] },
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  { $size: { $ifNull: ["$$this.plots", []] } },
                ],
              },
            },
          },
          bookedCount: {
            $reduce: {
              input: { $ifNull: ["$phases", []] },
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $size: {
                      $filter: {
                        input: { $ifNull: ["$$this.plots", []] },
                        as: "p",
                        cond: { $eq: ["$$p.status", "booked"] },
                      },
                    },
                  },
                ],
              },
            },
          },
          cornerPlots: {
            $reduce: {
              input: { $ifNull: ["$phases", []] },
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $size: {
                      $filter: {
                        input: { $ifNull: ["$$this.plots", []] },
                        as: "p",
                        cond: { $eq: ["$$p.isCorner", true] },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }

  /**
   * Get full project by product_id
   */
  async getProjectById(organization, productId) {
    const project = await Project.findOne({
      organization,
      product_id: parseInt(productId),
    });
    if (!project) throw new AppError("Project not found", 404);
    return project;
  }

  /**
   * Book a plot within a phase
   */
  async bookPlot(organization, productId, payload) {
    const { phaseId, plotId, leadName, leadUuid, profileId, phone, userId, userName } = payload;

    const project = await Project.findOne({ organization, product_id: parseInt(productId) });
    if (!project) throw new AppError("Project not found", 404);

    const phase = project.phases.find((p) => p.phaseId === phaseId);
    if (!phase) throw new AppError("Phase not found", 404);

    const plot = phase.plots.find((p) => p.plotId === plotId);
    if (!plot) throw new AppError("Plot not found", 404);
    if (plot.status !== "available") throw new AppError("Plot is already booked or sold", 400);

    plot.status = "booked";
    plot.bookedBy = {
      leadName,
      leadUuid,
      profileId,
      phone,
      userId,
      userName,
      bookedAt: new Date(),
    };
    project.markModified("phases");
    await project.save();
    return project;
  }

  /**
   * Reverse a plot booking
   */
  async reverseBooking(organization, productId, { phaseId, plotId }) {
    const project = await Project.findOne({ organization, product_id: parseInt(productId) });
    if (!project) throw new AppError("Project not found", 404);

    const phase = project.phases.find((p) => p.phaseId === phaseId);
    if (!phase) throw new AppError("Phase not found", 404);

    const plot = phase.plots.find((p) => p.plotId === plotId);
    if (plot) {
      plot.status = "available";
      plot.bookedBy = undefined;
      project.markModified("phases");
    }

    await project.save();
    return project;
  }

  /**
   * Get all booked plots across all phases for a project
   */
  async getProjectBookedPlots(organization, productId) {
    const project = await this.getProjectById(organization, productId);
    const bookedItems = [];

    project.phases.forEach((phase) => {
      phase.plots.forEach((plot) => {
        if (plot.status === "booked") {
          bookedItems.push({
            id: plot.plotId,
            label: `${phase.phaseName} - Plot ${plot.plotNumber}`,
            type: "plot",
            isCorner: plot.isCorner,
            bookedBy: plot.bookedBy,
            project_name: project.name,
            project_id: project.product_id,
          });
        }
      });
    });

    return bookedItems;
  }

  /**
   * Update project details
   */
  async updateProject(organization, productId, data) {
    const project = await Project.findOne({ organization, product_id: parseInt(productId) });
    if (!project) throw new AppError("Project not found", 404);

    // Handle phases parsing if needed
    if (typeof data.phases === "string") {
      data.phases = JSON.parse(data.phases);
    }

    // Update fields
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        project[key] = data[key];
      }
    });

    await project.save();
    return project;
  }

  /**
   * Soft delete a project
   */
  async deleteProject(organization, productId) {
    const project = await Project.findOne({ organization, product_id: parseInt(productId) });
    if (!project) throw new AppError("Project not found", 404);

    project.status = "deleted";
    await project.save();
    return { message: "Project deleted successfully" };
  }
}

export const projectService = new ProjectService();
