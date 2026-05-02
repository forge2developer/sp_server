import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "../proto/sp.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const spProto = grpc.loadPackageDefinition(packageDefinition).sp;

const GRPC_HOST = process.env.GRPC_HOST || "localhost:50051";

// Create gRPC clients
const userClient = new spProto.UserService(
  GRPC_HOST,
  grpc.credentials.createInsecure()
);

const projectClient = new spProto.ProjectService(
  GRPC_HOST,
  grpc.credentials.createInsecure()
);

const campaignClient = new spProto.CampaignService(
  GRPC_HOST,
  grpc.credentials.createInsecure()
);

const automationClient = new spProto.AutomationService(
  GRPC_HOST,
  grpc.credentials.createInsecure()
);

/**
 * Promisify a gRPC unary call
 */
function grpcCall(client, method, request) {
  return new Promise((resolve, reject) => {
    client[method](request, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
}

// ═══════════════════════════════════════════════════════════
// Exported functions for use in routes
// ═══════════════════════════════════════════════════════════

export async function fetchUsers(organization) {
  return grpcCall(userClient, "GetUsers", { organization: organization || "" });
}

export async function fetchUser(id) {
  return grpcCall(userClient, "GetUser", { id });
}

export async function fetchProjects(organization) {
  return grpcCall(projectClient, "GetProjects", { organization });
}

export async function fetchProject(organization, id) {
  return grpcCall(projectClient, "GetProject", { organization, id });
}

export async function fetchCampaigns(organization) {
  return grpcCall(campaignClient, "GetCampaigns", { organization });
}

export async function fetchCampaign(id) {
  return grpcCall(campaignClient, "GetCampaign", { id });
}

export async function fetchLeadCaptureConfigs(organization) {
  return grpcCall(automationClient, "GetLeadCaptureConfigs", { organization });
}

export async function fetchLeadCaptureConfig(id) {
  return grpcCall(automationClient, "GetLeadCaptureConfig", { id });
}
