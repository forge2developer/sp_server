import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";

import leadRoutes from "./routes/leadRoutes.js";
import projectRoutes from "./routes/project.routes.js";
import userRoutes from "./routes/user.routes.js";
import leadCaptureConfigRoutes from "./routes/leadCaptureConfig.routes.js";
import campaignRoutes from "./routes/campaign.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import grpcRoutes from "./routes/grpc.routes.js";
import { startGrpcServer } from "./grpc/grpcServer.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use("/uploads", express.static(path.resolve("uploads")));

// Routes
app.get("/", (req, res) => {
    res.send("SP Promoters API Running...");
});

app.use("/api/leads", leadRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lead-capture-configs", leadCaptureConfigRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/grpc", grpcRoutes);

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const GRPC_PORT = process.env.GRPC_PORT || 50051;

app.listen(PORT, () => {
    console.log(`REST server running on port ${PORT}`);
});

// Start gRPC server for data fetching
startGrpcServer(GRPC_PORT);