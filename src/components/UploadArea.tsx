import React, { useCallback, useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface UploadAreaProps {
    onUpload: (file: File) => Promise<void>;
    isLoading: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onUpload, isLoading }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [lastFileName, setLastFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                setLastFileName(file.name);
                await onUpload(file);
            } else {
                alert("Por favor, envie um arquivo PDF.");
            }
        }
    }, [onUpload]);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLastFileName(file.name);
            await onUpload(file);
        }
    };

    const handleAreaClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            onClick={handleAreaClick}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
                "relative flex flex-col items-center justify-center w-full h-44 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden group",
                isDragging
                    ? "border-violet-500 bg-violet-500/10 scale-[1.02]"
                    : "border-slate-700 bg-gradient-to-br from-surface/50 to-surface/30 hover:border-violet-500/50 hover:bg-surface/60",
                isLoading && "pointer-events-none opacity-80"
            )}
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleChange}
                disabled={isLoading}
            />

            <div className="flex flex-col items-center space-y-3 z-10 text-center px-4 pointer-events-none">
                {isLoading ? (
                    <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                ) : lastFileName ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in">
                        <CheckCircle className="w-10 h-10 text-emerald-400 mb-2" />
                        <p className="text-sm text-slate-300">
                            <span className="text-white font-medium">{lastFileName}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Clique para selecionar outro</p>
                    </div>
                ) : (
                    <>
                        <div className={cn(
                            "p-4 rounded-2xl transition-colors",
                            isDragging ? "bg-violet-500/20" : "bg-slate-800/50 group-hover:bg-slate-700/50"
                        )}>
                            <Upload className={cn(
                                "w-8 h-8 transition-colors",
                                isDragging ? "text-violet-400" : "text-slate-400 group-hover:text-violet-400"
                            )} />
                        </div>
                        <div>
                            <p className="text-base font-medium text-slate-200">
                                Arraste seu Histórico Escolar
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                ou clique para selecionar (PDF)
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
