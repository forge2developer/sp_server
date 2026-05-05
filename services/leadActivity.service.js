import LeadActivity from '../models/LeadActivity.model.js';
import Lead from '../models/Lead.js';
import { AppError } from '../middleware/errorHandler.js';

class LeadActivityService {
    async createActivity(data) {
        const activity = await LeadActivity.create(data);
        return activity;
    }

    async getActivitiesByLeadId(leadId) {
        return await LeadActivity.find({ lead_id: leadId }).sort({ createdAt: -1 });
    }

    async getSiteVisitsForCalendar({ startDate, endDate, userId, projectId }) {
        const query = {
            site_visit_date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        if (userId && userId !== 'all') query.user_id = userId;
        if (projectId && projectId !== 'all') query.site_visit_project_id = projectId;

        return await LeadActivity.find(query).sort({ site_visit_date: 1 });
    }

    async markSiteVisitCompleted(activityId, userId) {
        const activity = await LeadActivity.findById(activityId);
        if (!activity) throw new AppError('Activity not found', 404);

        activity.site_visit_completed = true;
        activity.site_visit_completed_at = new Date();
        activity.site_visit_completed_by = userId;
        await activity.save();

        return activity;
    }
}

export const leadActivityService = new LeadActivityService();
