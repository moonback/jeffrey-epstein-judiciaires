
import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, FileText } from 'lucide-react';

// Configure worker locally if possible or fallback to CDN
// Note: We use the mjs worker for v5+
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

interface PdfHoverPreviewProps {
    url: string;
    width?: number;
}

export const PdfHoverPreview: React.FC<PdfHoverPreviewProps> = ({ url, width = 280 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;
        let pdfDocs: any = null;

        const renderPage = async () => {
            try {
                if (isCancelled) return;
                setLoading(true);
                setError(null);

                // Clear canvas
                const canvas = canvasRef.current;
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx?.clearRect(0, 0, canvas.width, canvas.height);
                }

                const loadingTask = pdfjsLib.getDocument(url);
                pdfDocs = await loadingTask.promise;

                if (isCancelled) return;

                const page = await pdfDocs.getPage(1);

                if (isCancelled) return;

                const viewport = page.getViewport({ scale: 1.0 });
                const scale = width / viewport.width;
                const scaledViewport = page.getViewport({ scale });

                if (!canvas) return;

                const context = canvas.getContext('2d');
                if (!context) return;

                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport,
                };

                await page.render(renderContext).promise;

                if (!isCancelled) {
                    setLoading(false);
                }
            } catch (err) {
                console.error("PDF Preview Error", err);
                if (!isCancelled) {
                    setError("Aperçu indisponible");
                    setLoading(false);
                }
            }
        };

        renderPage();

        return () => {
            isCancelled = true;
            if (pdfDocs) {
                pdfDocs.destroy().catch(() => { });
            }
        };
    }, [url, width]);

    return (
        <div
            className="bg-white rounded-xl shadow-2xl border-[3px] border-[#B91C1C] overflow-hidden relative z-50 animate-in fade-in zoom-in-95 duration-200"
            style={{ width: width }}
        >
            <div className="bg-[#B91C1C] px-3 py-1 flex items-center justify-between">
                <span className="text-[9px] text-white font-black uppercase tracking-widest flex items-center gap-2">
                    <FileText size={10} /> Aperçu Page 1
                </span>
            </div>

            <div className="relative min-h-[200px] bg-slate-100 flex items-center justify-center">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                        <Loader2 className="animate-spin text-[#B91C1C] mb-2" size={24} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#B91C1C]">Rendu en cours...</span>
                    </div>
                )}

                {error ? (
                    <div className="p-6 text-center">
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2 text-[#B91C1C]">
                            <FileText size={20} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{error}</p>
                    </div>
                ) : (
                    <canvas ref={canvasRef} className="block w-full h-auto" />
                )}
            </div>
        </div>
    );
};
