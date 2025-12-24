"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileVideo, FileImage, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
    onFileSelect: (file: File) => void;
    isAnalyzing: boolean;
}

export function Dropzone({ onFileSelect, isAnalyzing }: DropzoneProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileType, setFileType] = useState<"video" | "image" | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragActive(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        []
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
        },
        []
    );

    const handleFile = (file: File) => {
        if (file.type.startsWith("video/")) {
            setFileType("video");
            setPreview(URL.createObjectURL(file));
            onFileSelect(file);
        } else if (file.type.startsWith("image/")) {
            setFileType("image");
            setPreview(URL.createObjectURL(file));
            onFileSelect(file);
        } // else ignore
    };

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        setFileType(null);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out p-12 overflow-hidden",
                    isDragActive
                        ? "border-primary bg-primary/10 scale-[1.02]"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/5",
                    preview ? "border-none p-0" : ""
                )}
            >
                <input
                    type="file"
                    className="absolute inset-0 z-50 opacity-0 cursor-pointer"
                    onChange={handleFileInput}
                    disabled={!!preview || isAnalyzing}
                    accept="video/*,image/*"
                />

                <AnimatePresence>
                    {!preview ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center gap-4 text-center"
                        >
                            <div className="p-4 rounded-full bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                                <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold tracking-tight">
                                    Drop your creative here
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Support for MP4, MOV, JPG, PNG
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black"
                        >
                            {fileType === "video" ? (
                                <video src={preview!} controls className="w-full h-full object-contain" />
                            ) : (
                                <img src={preview!} alt="preview" className="w-full h-full object-contain" />
                            )}

                            {/* Clear Button */}
                            {!isAnalyzing && (
                                <button
                                    onClick={clearFile}
                                    className="absolute top-4 right-4 z-[60] p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Decorative Gradients */}
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
            </div>
        </div>
    );
}
