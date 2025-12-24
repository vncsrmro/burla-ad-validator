"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Dropzone } from "@/components/dropzone";
import { Button } from "@/components/ui/button";
import { AnalysisResult } from "@/types";
import { Loader2, ShieldCheck, LogOut } from "lucide-react";
import { ResultsView } from "@/components/results-view";
import { extractFramesFromVideo } from "@/lib/video-processor";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file); // Send video for Audio processing (Whisper)

      // 1. Client-Side Processing (Frames)
      if (file.type.startsWith("video")) {
        setStatusText("Extracting frames in browser...");
        const frames = await extractFramesFromVideo(file);
        console.log(`Extracted ${frames.length} frames`);
        formData.append("frames", JSON.stringify(frames));
      } else {
        // For images, we just convert the single image to base64
        // TODO: specific logic for image files if needed, but for now we focus on video flow
        // Basic image reader:
        setStatusText("Processing image...");
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        formData.append("frames", JSON.stringify([base64]));
      }

      setStatusText("Analyzing with AI (Serverless)...");

      // 2. Send to Next.js API
      const response = await axios.post("/api/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(response.data);
    } catch (error: any) {
      console.error("Error analyzing:", error);
      alert(`Analysis failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsAnalyzing(false);
      setStatusText("");
    }
  };

  if (!user) return null; // Loading state handled by redirect

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-20"></div>

      {/* Header */}
      <header className="border-b bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Ad Policy Validator</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">New Analysis</h1>
            <p className="text-muted-foreground">Upload your creative to check for policy violations.</p>
          </div>

          <Dropzone
            onFileSelect={(f) => {
              setFile(f);
              setResult(null);
            }}
            isAnalyzing={isAnalyzing}
          />

          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className="w-full max-w-xs text-base h-12 rounded-xl"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {statusText || "Processing..."}
                </>
              ) : (
                "Analyze Compliance"
              )}
            </Button>
            {isAnalyzing && <p className="text-xs text-muted-foreground animate-pulse">This may take up to 30 seconds</p>}
          </div>

          {result && <ResultsView result={result} />}
        </div>
      </div>
    </main>
  );
}
