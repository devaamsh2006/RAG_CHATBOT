"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UploadTab({ files, setFiles }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    };

    const handleFileSelect = (e) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            handleFiles(selectedFiles);
        }
    };

    const handleFiles = (newFiles) => {
        const validFiles = newFiles.filter(
            (file) =>
                file.type === "application/pdf" ||
                file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                file.type === "text/plain"
        );

        const newFileObjs = validFiles.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
            type: file.type.split("/")[1] || "txt",
            uploadDate: new Date().toLocaleTimeString(),
            status: 'pending'
        }));

        setFiles((prev) => [...prev, ...newFileObjs]);
    };

    const handleUpload = async () => {
        setIsUploading(true);
        const pendingFiles = files.filter(f => f.status === 'pending');

        for (const fileObj of pendingFiles) {
            setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading' } : f));

            const formData = new FormData();
            formData.append('file', fileObj.file);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Upload failed');

                await response.json();

                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'success' } : f));
            } catch (error) {
                console.error('Upload error:', error);
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error' } : f));
            }
        }
        setIsUploading(false);
    };

    const removeFile = (id) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl mx-auto"
        >
            <div
                className={cn(
                    "glass-panel rounded-2xl p-12 text-center border-2 border-dashed transition-all duration-300 cursor-pointer mb-8",
                    isDragging
                        ? "border-[var(--neon-blue)] bg-white/5"
                        : "border-white/10 hover:border-white/20 hover:bg-white/5"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                        <UploadCloud className="w-8 h-8 text-[var(--neon-blue)]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
                        <p className="text-slate-400">Drag & drop PDF, DOCX, or TXT files here</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                    {files.map((file) => (
                        <motion.div
                            key={file.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                            className="glass-card rounded-xl p-4 flex items-center gap-4 group relative overflow-hidden"
                        >
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-[var(--neon-purple)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate text-sm">{file.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>{file.size}</span>
                                    <span>•</span>
                                    <span>{file.uploadDate}</span>
                                    {file.status === 'pending' && <span className="text-yellow-400">• Pending</span>}
                                    {file.status === 'uploading' && <span className="text-blue-400">• Uploading...</span>}
                                    {file.status === 'success' && <span className="text-green-400">• Uploaded</span>}
                                    {file.status === 'error' && <span className="text-red-400">• Error</span>}
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(file.id);
                                }}
                                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Success Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Submit Button */}
            {files.some(f => f.status === 'pending') && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="px-8 py-3 rounded-full bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] text-white font-semibold shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="w-5 h-5" />
                                Process Files
                            </>
                        )}
                    </button>
                </div>
            )}
        </motion.div>
    );
}
