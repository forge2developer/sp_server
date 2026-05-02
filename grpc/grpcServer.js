import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";
import * as userService from "../services/user.service.js";
import { projectService } from "../services/project.service.js";
import * as campaignService from "../services/campaign.service.js";
import * as leadCaptureService from "../services/leadCaptureConfig.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "../proto/sp.proto");

// Load the proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const spProto = grpc.loadPackageDefinition(packageDefinition).sp;

// ═══════════════════════════════════════════════════════════
// User Service Implementations
// ═══════════════════════════════════════════════════════════

async function getUsers(call, callback) {
  try {
    const { organization } = call.request;
    const users = await userService.getAllUsers(organization || undefined);

    const usersData = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      role: u.role,
      organization: u.organization || "",
      isActive: u.isActive,
      createdAt: u.createdAt?.toISOString() || "",
      updatedAt: u.updatedAt?.toISOString() || "",
      profile_id: u.profile_id || 0,
    }));

    callback(null, {
      success: true,
      count: usersData.length,
      users: usersData,
    });
  } catch (err) {
    console.error("gRPC GetUsers error:", err.message);
    callback({
      code: grpc.status.INTERNAL,
      message: err.message,
    });
  }
}

async function getUser(call, callback) {
  try {
    const { id } = call.request;
    const user = await userService.getUserById(id);

    callback(null, {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        organization: user.organization || "",
        isActive: user.isActive,
        createdAt: user.createdAt?.toISOString() || "",
        updatedAt: user.updatedAt?.toISOString() || "",
        profile_id: user.profile_id || 0,
      },
    });
  } catch (err) {
    console.error("gRPC GetUser error:", err.message);
    callback({
      code: err.statusCode === 404 ? grpc.status.NOT_FOUND : grpc.status.INTERNAL,
      message: err.message,
    });
  }
}

// ═══════════════════════════════════════════════════════════
// Project Service Implementations
// ═══════════════════════════════════════════════════════════

async function getProjects(call, callback) {
  try {
    const { organization } = call.request;
    if (!organization) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Organization is required",
      });
    }

    const projects = await projectService.getAllProjects(organization);

    const projectsData = projects.map((p) => ({
      id: p._id.toString(),
      product_id: p.product_id,
      organization: p.organization,
      property: p.property || "",
      name: p.name,
      location: p.location || "",
      layoutImages: p.layoutImages || [],
      status: p.status,
      createdAt: p.createdAt?.toISOString() || "",
      phaseCount: p.phaseCount || 0,
      totalPlots: p.totalPlots || 0,
      bookedCount: p.bookedCount || 0,
      cornerPlots: p.cornerPlots || 0,
    }));

    callback(null, {
      success: true,
      count: projectsData.length,
      projects: projectsData,
    });
  } catch (err) {
    console.error("gRPC GetProjects error:", err.message);
    callback({
      code: grpc.status.INTERNAL,
      message: err.message,
    });
  }
}

async function getProject(call, callback) {
  try {
    const { organization, id } = call.request;
    const project = await projectService.getProjectById(organization, id);

    callback(null, {
      success: true,
      project: {
        id: project._id.toString(),
        product_id: project.product_id,
        organization: project.organization,
        property: project.property || "",
        name: project.name,
        location: project.location || "",
        layoutImages: project.layoutImages || [],
        status: project.status,
        createdAt: project.createdAt?.toISOString() || "",
        phaseCount: project.phases?.length || 0,
        totalPlots: project.phases?.reduce((sum, p) => sum + (p.plots?.length || 0), 0) || 0,
        bookedCount: project.phases?.reduce((sum, p) => sum + (p.plots?.filter(pl => pl.status === "booked").length || 0), 0) || 0,
        cornerPlots: project.phases?.reduce((sum, p) => sum + (p.plots?.filter(pl => pl.isCorner).length || 0), 0) || 0,
      },
    });
  } catch (err) {
    console.error("gRPC GetProject error:", err.message);
    callback({
      code: err.statusCode === 404 ? grpc.status.NOT_FOUND : grpc.status.INTERNAL,
      message: err.message,
    });
  }
}
// ═══════════════════════════════════════════════════════════
// Campaign Service Implementations
// ═══════════════════════════════════════════════════════════

async function getCampaigns(call, callback) {
  try {
    const { organization } = call.request;
    const campaigns = await campaignService.getAllCampaigns(organization);
    
    const campaignsData = campaigns.map(c => ({
      id: c._id.toString(),
      campaignName: c.campaignName,
      organization: c.organization,
      status: c.status,
      createdAt: c.createdAt?.toISOString() || "",
      sourceCount: c.sources?.length || 0,
      endpointCount: c.sources?.reduce((acc, s) => acc + (s.subSources?.length || 0), 0) || 0,
      sources: (c.sources || []).map(s => ({
        uuid: s.uuid || "",
        sourceName: s.sourceName,
        subSources: (s.subSources || []).map(ss => ({
          uuid: ss.uuid || "",
          subSourceName: ss.subSourceName
        }))
      }))
    }));

    callback(null, {
      success: true,
      count: campaignsData.length,
      data: campaignsData
    });
  } catch (err) {
    console.error("gRPC GetCampaigns error:", err.message);
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function getCampaign(call, callback) {
  try {
    const { id } = call.request;
    const campaign = await campaignService.getCampaignById(id);
    
    callback(null, {
      success: true,
      data: {
        id: campaign._id.toString(),
        campaignName: campaign.campaignName,
        organization: campaign.organization,
        status: campaign.status,
        createdAt: campaign.createdAt?.toISOString() || "",
        sourceCount: campaign.sources?.length || 0,
        endpointCount: campaign.sources?.reduce((acc, s) => acc + (s.subSources?.length || 0), 0) || 0,
        sources: (campaign.sources || []).map(s => ({
          uuid: s.uuid || "",
          sourceName: s.sourceName,
          subSources: (s.subSources || []).map(ss => ({
            uuid: ss.uuid || "",
            subSourceName: ss.subSourceName
          }))
        }))
      }
    });
  } catch (err) {
    console.error("gRPC GetCampaign error:", err.message);
    callback({
      code: err.statusCode === 404 ? grpc.status.NOT_FOUND : grpc.status.INTERNAL,
      message: err.message
    });
  }
}

// ═══════════════════════════════════════════════════════════
// Automation Service Implementations
// ═══════════════════════════════════════════════════════════

async function getLeadCaptureConfigs(call, callback) {
  try {
    const { organization } = call.request;
    const configs = await leadCaptureService.getAllConfigs(organization);
    
    const configsData = configs.map(c => ({
      id: c._id.toString(),
      name: c.name,
      organization: c.organization,
      source: c.source || "",
      status: c.status,
      createdAt: c.createdAt?.toISOString() || "",
      campaign_name: c.campaign_name || "",
      sub_source: c.sub_source || "",
      project_ids: Array.isArray(c.project_ids) ? c.project_ids.filter(id => !!id).map(id => id?._id?.toString() || id?.toString() || "") : [],
      selected_contact_fields: Array.isArray(c.selected_contact_fields) ? c.selected_contact_fields : [],
      manual_contact_fields: Array.isArray(c.manual_contact_fields) ? c.manual_contact_fields.filter(f => !!f).map(f => ({ key: f.key || "", value: f.value || "" })) : [],
      selected_fields: Array.isArray(c.selected_fields) ? c.selected_fields : [],
      manual_requirements: Array.isArray(c.manual_requirements) ? c.manual_requirements.filter(f => !!f).map(f => ({ key: f.key || "", value: f.value || "" })) : [],
      assigned_people: Array.isArray(c.assigned_people) ? c.assigned_people.filter(p => !!p).map(p => ({
        id: p.id || "",
        name: p.name || "",
        email: p.email || "",
        phone: p.phone || "",
        role: p.role || "",
        category: p.category || "",
        type: p.type || ""
      })) : []
    }));

    callback(null, {
      success: true,
      count: configsData.length,
      data: configsData
    });
  } catch (err) {
    console.error("gRPC GetLeadCaptureConfigs error:", err.message);
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function getLeadCaptureConfig(call, callback) {
  try {
    const { id } = call.request;
    const config = await leadCaptureService.getConfigById(id);
    
    callback(null, {
      success: true,
      data: {
        id: config._id.toString(),
        name: config.name,
        organization: config.organization,
        source: config.source || "",
        status: config.status,
        createdAt: config.createdAt?.toISOString() || "",
        campaign_name: config.campaign_name || "",
        sub_source: config.sub_source || "",
        project_ids: Array.isArray(config.project_ids) ? config.project_ids.filter(id => !!id).map(id => id?._id?.toString() || id?.toString() || "") : [],
        selected_contact_fields: Array.isArray(config.selected_contact_fields) ? config.selected_contact_fields : [],
        manual_contact_fields: Array.isArray(config.manual_contact_fields) ? config.manual_contact_fields.filter(f => !!f).map(f => ({ key: f.key || "", value: f.value || "" })) : [],
        selected_fields: Array.isArray(config.selected_fields) ? config.selected_fields : [],
        manual_requirements: Array.isArray(config.manual_requirements) ? config.manual_requirements.filter(f => !!f).map(f => ({ key: f.key || "", value: f.value || "" })) : [],
        assigned_people: Array.isArray(config.assigned_people) ? config.assigned_people.filter(p => !!p).map(p => ({
          id: p.id || "",
          name: p.name || "",
          email: p.email || "",
          phone: p.phone || "",
          role: p.role || "",
          category: p.category || "",
          type: p.type || ""
        })) : []
      }
    });
  } catch (err) {
    console.error("gRPC GetLeadCaptureConfig error:", err.message);
    callback({
      code: err.statusCode === 404 ? grpc.status.NOT_FOUND : grpc.status.INTERNAL,
      message: err.message
    });
  }
}

// ═══════════════════════════════════════════════════════════
// Start gRPC Server
// ═══════════════════════════════════════════════════════════

export function startGrpcServer(port = 50051) {
  const server = new grpc.Server();

  server.addService(spProto.UserService.service, {
    GetUsers: getUsers,
    GetUser: getUser,
  });

  server.addService(spProto.ProjectService.service, {
    GetProjects: getProjects,
    GetProject: getProject,
  });

  server.addService(spProto.CampaignService.service, {
    GetCampaigns: getCampaigns,
    GetCampaign: getCampaign,
  });

  server.addService(spProto.AutomationService.service, {
    GetLeadCaptureConfigs: getLeadCaptureConfigs,
    GetLeadCaptureConfig: getLeadCaptureConfig,
  });

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error("Failed to start gRPC server:", err);
        return;
      }
      console.log(`gRPC server running on port ${boundPort}`);
    }
  );

  return server;
}
