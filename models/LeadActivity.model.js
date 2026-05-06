import mongoose from 'mongoose';
import crypto from 'crypto';

const LeadActivitySchema = new mongoose.Schema(
    {
        _id: { 
            type: String, 
            default: () => crypto.randomUUID() 
        },
        profile_id: { type: Number, required: false },
        lead_id: { type: mongoose.Schema.Types.Mixed, required: true },
        user_id: { type: String, required: false },
        updates: { type: String, required: false },
        reason: { type: String, required: false },
        stage: { type: String, required: false },
        status: { type: String, required: false },
        notes: { type: String, required: false },
        follow_up_date: { type: Date, required: false },
        site_visit_date: { type: Date, required: false },
        site_visit_completed: { type: Boolean, default: false },
        site_visit_completed_at: { type: Date, default: null },
        site_visit_completed_by: { type: String, default: null },
        site_visit_project_id: { type: String, default: null },
        site_visit_project_name: { type: String, default: null }
    },
    {
        timestamps: true,
        collection: 'lead_activities'
    }
);

LeadActivitySchema.index({ lead_id: 1 });
LeadActivitySchema.index({ profile_id: 1 });

const LeadActivity = mongoose.model('LeadActivity', LeadActivitySchema);

export default LeadActivity;
