import { Router } from "express";
import { dashboardService } from "../services/dashboard.service.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/calendar-metrics", protect, async (req, res, next) => {
    try {
        const { startDate, endDate, userId, projectId } = req.query;
        const result = await dashboardService.getCalendarMetrics(startDate, endDate, userId, projectId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.get("/leads-by-metric", protect, async (req, res, next) => {
    try {
        const { date, metricKey, userId, projectId } = req.query;
        const result = await dashboardService.getLeadsByCalendarMetric(date, metricKey, userId, projectId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
