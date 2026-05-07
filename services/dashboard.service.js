import LeadActivity from '../models/LeadActivity.model.js';
import Project from '../models/project.model.js';
import Lead from '../models/Lead.js';
import { AppError } from '../middleware/errorHandler.js';

class DashboardService {
    async getCalendarMetrics(startDate, endDate, userId, projectId) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // 1. Fetch Site Visits (Scheduled and Done) from LeadActivity
        const visitQuery = {
            site_visit_date: { $gte: start, $lte: end }
        };
        if (userId && userId !== 'all') visitQuery.user_id = userId;
        if (projectId && projectId !== 'all') visitQuery.site_visit_project_id = projectId;

        const visits = await LeadActivity.find(visitQuery).lean();

        // 2. Fetch Booked Units from Project
        const projectQuery = { status: "active" };
        if (projectId && projectId !== 'all') {
            projectQuery.product_id = parseInt(projectId);
        }
        
        const projects = await Project.find(projectQuery).lean();
        const bookings = [];
        projects.forEach(project => {
            project.phases.forEach(phase => {
                phase.plots.forEach(plot => {
                    if (plot.status === "booked" && plot.bookedBy?.bookedAt) {
                        const bookedAt = new Date(plot.bookedBy.bookedAt);
                        if (bookedAt >= start && bookedAt <= end) {
                            // Filter by user if requested
                            if (userId && userId !== 'all' && plot.bookedBy.userId !== userId) {
                                return;
                            }
                            bookings.push({
                                date: bookedAt.toISOString().split('T')[0],
                                ...plot.bookedBy
                            });
                        }
                    }
                });
            });
        });

        // 3. Process metrics by date
        const dateMap = new Map();

        // Helper to add metric
        const addMetric = (date, key, count = 1) => {
            if (!dateMap.has(date)) dateMap.set(date, []);
            const dayMetrics = dateMap.get(date);
            const existing = dayMetrics.find(m => m.key === key);
            if (existing) {
                existing.count += count;
            } else {
                dayMetrics.push({ key, count });
            }
        };

        // Add Visit metrics
        visits.forEach(v => {
            const date = v.site_visit_date.toISOString().split('T')[0];
            if (v.site_visit_completed) {
                addMetric(date, 'site_visit_done');
            } else {
                addMetric(date, 'site_visit_scheduled');
            }
        });

        // Add Booking metrics
        bookings.forEach(b => {
            addMetric(b.date, 'booked_units');
        });

        const days = Array.from(dateMap.entries()).map(([date, metrics]) => ({
            date,
            metrics
        }));

        const config = [
            { key: 'site_visit_scheduled', label: 'SV Scheduled', color: '#6366F1' },
            { key: 'site_visit_done', label: 'SV Done', color: '#10B981' },
            { key: 'booked_units', label: 'Booked Units', color: '#F59E0B' }
        ];

        return { days, config };
    }

    async getLeadsByCalendarMetric(date, metricKey, userId, projectId) {
        const start = new Date(date);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        if (metricKey === 'site_visit_scheduled' || metricKey === 'site_visit_done') {
            const isCompleted = metricKey === 'site_visit_done';
            const activityQuery = {
                site_visit_date: { $gte: start, $lte: end },
                site_visit_completed: isCompleted
            };
            if (userId && userId !== 'all') activityQuery.user_id = userId;
            if (projectId && projectId !== 'all') activityQuery.site_visit_project_id = projectId;

            const activities = await LeadActivity.find(activityQuery).lean();

            const leadIds = activities.map(a => a.lead_id);
            const leads = await Lead.find({ _id: { $in: leadIds } }).lean();

            return leads.map(l => ({
                id: l._id,
                name: l.name,
                phone: l.phone,
                status: l.status,
                updatedAt: l.updatedAt
            }));
        }

        if (metricKey === 'booked_units') {
            const projectQuery = { status: "active" };
            if (projectId && projectId !== 'all') {
                projectQuery.product_id = parseInt(projectId);
            }

            const projects = await Project.find(projectQuery).lean();
            const bookedLeads = [];
            
            for (const project of projects) {
                for (const phase of project.phases) {
                    for (const plot of phase.plots) {
                        if (plot.status === "booked" && plot.bookedBy?.bookedAt) {
                            const bookedAt = new Date(plot.bookedBy.bookedAt);
                            if (bookedAt >= start && bookedAt <= end) {
                                // Filter by user if requested
                                if (userId && userId !== 'all' && plot.bookedBy.userId !== userId) {
                                    continue;
                                }

                                // Find lead details if possible
                                const lead = await Lead.findOne({ 
                                    $or: [
                                        { _id: plot.bookedBy.leadUuid },
                                        { phone: plot.bookedBy.phone }
                                    ]
                                }).lean();

                                bookedLeads.push({
                                    id: lead?._id || plot.bookedBy.leadUuid || 'unknown',
                                    name: lead?.name || plot.bookedBy.leadName,
                                    phone: lead?.phone || plot.bookedBy.phone,
                                    status: lead?.status || 'Booked',
                                    project_name: project.name,
                                    plot_label: `${phase.phaseName} - ${plot.plotNumber}`,
                                    updatedAt: plot.bookedBy.bookedAt
                                });
                            }
                        }
                    }
                }
            }
            return bookedLeads;
        }

        return [];
    }
}

export const dashboardService = new DashboardService();
