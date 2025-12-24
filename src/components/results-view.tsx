"use client";

import React from "react";
import { AnalysisResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResultsViewProps {
    result: AnalysisResult;
}

export function ResultsView({ result }: ResultsViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full max-w-4xl mx-auto"
        >
            {/* Overview Card */}
            <Card className="border-l-4 border-l-primary overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <h1 className="text-9xl font-bold">{result.risk_score}</h1>
                </div>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Risk Analysis Report</span>
                        <RiskBadge score={result.risk_score} />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Overall Feedback</p>
                            <p className="text-lg leading-relaxed">{result.details.overall_feedback}</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>Risk Score</span>
                                <span className="font-bold">{result.risk_score}/100</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full transition-all duration-1000 ease-out",
                                        result.risk_score < 30 ? "bg-green-500" :
                                            result.risk_score < 70 ? "bg-yellow-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${result.risk_score}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Platforms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PlatformCard
                    platform="Google Ads"
                    status={result.platforms.google.status}
                    reasons={result.platforms.google.reasons}
                />
                <PlatformCard
                    platform="Meta Ads"
                    status={result.platforms.meta.status}
                    reasons={result.platforms.meta.reasons}
                />
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Visual Triggers</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {result.details.visual_triggers.map((trigger, i) => (
                                <li key={i} className="flex items-start gap-2 bg-secondary/30 p-2 rounded-md">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1 shrink-0" />
                                    <span className="text-sm">{trigger}</span>
                                </li>
                            ))}
                            {result.details.visual_triggers.length === 0 && (
                                <p className="text-sm text-muted-foreground">No visual issues detected.</p>
                            )}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Audio/Text Triggers</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {result.details.audio_triggers.map((trigger, i) => (
                                <li key={i} className="flex items-start gap-2 bg-secondary/30 p-2 rounded-md">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1 shrink-0" />
                                    <span className="text-sm">{trigger}</span>
                                </li>
                            ))}
                            {result.details.audio_triggers.length === 0 && (
                                <p className="text-sm text-muted-foreground">No audio issues detected.</p>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>

        </motion.div>
    );
}

function RiskBadge({ score }: { score: number }) {
    if (score < 30) return <Badge variant="success" className="bg-green-600">Low Risk</Badge>;
    if (score < 70) return <Badge variant="warning" className="bg-yellow-600">Medium Risk</Badge>;
    return <Badge variant="destructive">High Risk</Badge>;
}

function PlatformCard({ platform, status, reasons }: { platform: string; status: string; reasons: string[] }) {
    const isApproved = status === "approved";
    const isLimited = status === "limited";

    return (
        <Card className={cn("border-t-4",
            isApproved ? "border-t-green-500" :
                isLimited ? "border-t-yellow-500" : "border-t-red-500"
        )}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{platform}</CardTitle>
                {isApproved && <CheckCircle className="text-green-500" />}
                {isLimited && <AlertTriangle className="text-yellow-500" />}
                {(!isApproved && !isLimited) && <XCircle className="text-red-500" />}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Status:</span>
                        <span className={cn("font-bold capitalize",
                            isApproved ? "text-green-500" :
                                isLimited ? "text-yellow-500" : "text-red-500"
                        )}>{status}</span>
                    </div>
                    {reasons.length > 0 && (
                        <div className="bg-background rounded-md p-3 text-sm border">
                            <p className="font-semibold mb-2 text-xs uppercase text-muted-foreground">Potential Violations</p>
                            <ul className="space-y-1 list-disc pl-4 text-muted-foreground">
                                {reasons.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
