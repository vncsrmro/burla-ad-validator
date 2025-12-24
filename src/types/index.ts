export interface AnalysisResult {
    status: "approved" | "rejected" | "warning";
    risk_score: number; // 0-100
    platforms: {
        google: {
            status: "approved" | "rejected" | "limited";
            reasons: string[];
        };
        meta: {
            status: "approved" | "rejected" | "limited";
            reasons: string[];
        };
    };
    details: {
        visual_triggers: string[];
        audio_triggers: string[];
        overall_feedback: string;
    };
}
