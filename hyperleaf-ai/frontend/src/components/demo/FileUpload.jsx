import React, { useCallback, useState } from 'react';
import { Upload, File, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const FileUpload = ({ onFileSelect, isAnalyzing }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            // In production, validate file type here
            setSelectedFile(file);
            onFileSelect(file);
        }
    }, [onFileSelect]);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            onFileSelect(file);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
                    dragActive ? "border-primary bg-primary/5" : "border-border bg-card",
                    selectedFile ? "border-green-500/50 bg-green-500/5" : "hover:border-primary/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
            >
                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".tiff,.tif"
                    onChange={handleChange}
                />

                <AnimatePresence mode="wait">
                    {isAnalyzing ? (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-4"
                        >
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                            <p className="text-lg font-medium">Processing Hyperspectral Data...</p>
                            <p className="text-sm text-muted-foreground">Analyzing 204 spectral bands</p>
                        </motion.div>
                    ) : selectedFile ? (
                        <motion.div
                            key="selected"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-lg font-bold text-foreground">{selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-xl font-bold mb-2">Upload Hyperspectral Image</p>
                            <p className="text-muted-foreground mb-4">Drag & drop or click to browse (.tiff)</p>
                            <span className="px-3 py-1 bg-muted rounded text-xs font-mono text-muted-foreground">
                                Supported: 204x48x352 TIFF
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Example Progress Bar (simulated during analysis) */}
                {isAnalyzing && (
                    <motion.div
                        className="absolute bottom-0 left-0 h-1 bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                )}
            </div>
        </div>
    );
};

export default FileUpload;
