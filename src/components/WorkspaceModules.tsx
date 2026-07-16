'use client';

import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import type { UploadedFile } from '@/types';
import { renderFormattedContent } from '@/lib/formatResponse';


type View = 'dashboard' | 'chat' | 'uploads' | 'documents' | 'screen-share' | 'analytics' | 'devices' | 'calendar' | 'settings';

interface WorkspaceModulesProps {
  activeView: View;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

export default function WorkspaceModules({ activeView, files, onFilesChange }: WorkspaceModulesProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareStream, setShareStream] = useState<MediaStream | null>(null);
  const [capturedScreenshot, setCapturedScreenshot] = useState<UploadedFile | null>(null);
  const [analysisOutput, setAnalysisOutput] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [captureError, setCaptureError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previousScreenshotUrlRef = useRef<string | null>(null);
  const [screenshots, setScreenshots] = useState<UploadedFile[]>([]);
  const [uploadAnalysisOutput, setUploadAnalysisOutput] = useState('');
  const [uploadAnalysisLoading, setUploadAnalysisLoading] = useState(false);
  const [analyzedFileName, setAnalyzedFileName] = useState('');

  const captureScreenshot = async () => {
    if (!shareStream || !videoRef.current) {
      setCaptureError('Start screen sharing first to capture a screenshot.');
      return;
    }

    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (!context) {
      setCaptureError('Unable to capture screenshot from the video stream.');
      return;
    }

    context.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) {
      setCaptureError('Unable to create screenshot image.');
      return;
    }

    const previewUrl = URL.createObjectURL(blob);
    if (previousScreenshotUrlRef.current) {
      URL.revokeObjectURL(previousScreenshotUrlRef.current);
    }
    previousScreenshotUrlRef.current = previewUrl;

    const newScreenshot: UploadedFile = {
      id: `screen-capture-${Date.now()}`,
      name: `screen-capture-${Date.now()}.png`,
      type: 'image',
      size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
      preview: previewUrl,
    };

    setCapturedScreenshot(newScreenshot);
    setScreenshots(prev => [newScreenshot, ...prev]);
    onFilesChange([newScreenshot, ...files]);
    setAnalysisOutput('');
    setCaptureError('');
  };

  useEffect(() => {
    if (videoRef.current && shareStream) {
      videoRef.current.srcObject = shareStream;
    }
  }, [shareStream]);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const preparedFiles = selectedFiles
      .filter(file => file.type.startsWith('image/') || file.type === 'application/pdf')
      .map(file => ({
        id: `${file.name}-${file.size}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'pdf' as 'image' | 'pdf',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }));

    if (preparedFiles.length) {
      onFilesChange([...preparedFiles, ...files]);
    }

    event.target.value = '';
  };

  const analysisPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (uploadAnalysisOutput && !uploadAnalysisLoading) {
      setTimeout(() => {
        analysisPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [uploadAnalysisOutput, uploadAnalysisLoading]);

  const analyzeUploadedFile = async (file: UploadedFile) => {
    if (uploadAnalysisLoading) return;

    setUploadAnalysisLoading(true);
    setUploadAnalysisOutput('');
    setAnalyzedFileName(file.name);

    try {
      let screenshotBase64 = '';
      if (file.preview) {
        const response = await fetch(file.preview);
        const blob = await response.blob();
        screenshotBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const apiResponse = await fetch('/api/nova-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `Analyze this ${file.type === 'image' ? 'image' : 'PDF document'} named "${file.name}" in detail. Describe what you see, identify UI elements, layout, content, text, colors, and any notable features. Be thorough and organized.`,
          files: [{
            id: file.id,
            name: file.name,
            type: file.type,
            size: file.size,
            preview: file.preview,
          }],
          screenshotBase64,
        }),
      });

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        if (typeof data?.content === 'string' && data.content.trim()) {
          setUploadAnalysisOutput(data.content);
        } else {
          throw new Error('Empty response');
        }
      } else {
        throw new Error('API error');
      }
    } catch {
      setUploadAnalysisOutput(
        'Nova API is not available.\n\nMake sure you have NOVA_API_KEY set in .env.local. Without it, the AI cannot analyze files.'
      );
    }

    setUploadAnalysisLoading(false);
  };

  const removeFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    const updated = files.filter(file => file.id !== fileId);
    onFilesChange(updated);
  };

  const images = files.filter(file => file.type === 'image');
  const pdfs = files.filter(file => file.type === 'pdf');

  const renderPlaceholder = (title: string, description: string) => (
    <div className="glass-panel-light p-4 rounded-2xl border border-white/10">
      <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/70">{title}</p>
      <p className="mt-2 text-sm text-white/70">{description}</p>
    </div>
  );

  switch (activeView) {
    case 'uploads':
      return (
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-cyan-400/20">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/70">Upload hub</p>
                <h2 className="text-xl font-semibold text-white">Media and document intake</h2>
                <p className="mt-2 text-sm text-white/60">Upload images and PDFs, then ask Nova to summarize, inspect, or turn them into action items. Hover to remove.</p>
              </div>
              <div className="flex gap-2">
                <label className="cursor-pointer rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200 transition hover:bg-cyan-500/20">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                  Upload images
                </label>
                <label className="cursor-pointer rounded-xl border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-xs text-violet-200 transition hover:bg-violet-500/20">
                  <input type="file" accept=".pdf" multiple className="hidden" onChange={handleUpload} />
                  Upload PDFs
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass-panel-light p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Images</h3>
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">{images.length} ready</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {images.length ? images.map(file => (
                  <div key={file.id} className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 group">
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/60 hover:bg-rose-500/80 hover:text-white hover:border-rose-400/50 transition-all opacity-0 group-hover:opacity-100"
                      title="Remove image"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {file.preview ? (
                      <img src={file.preview} alt={file.name} className="h-24 w-full object-cover" />
                    ) : (
                      <div className="flex h-24 items-center justify-center bg-white/5 text-xs text-white/40">Preview unavailable</div>
                    )}
                    <div className="p-2 text-[11px] text-white/70">
                      <p className="truncate font-medium">{file.name}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-white/40">{file.size}</p>
                        <button
                          onClick={() => analyzeUploadedFile(file)}
                          disabled={uploadAnalysisLoading}
                          className="w-5 h-5 rounded-full bg-cyan-400/15 border border-cyan-400/25 flex items-center justify-center text-cyan-300 hover:bg-cyan-400/40 hover:text-white hover:border-cyan-400/50 transition-all disabled:opacity-40"
                          title="Analyze with AI"
                        >
                          {uploadAnalysisLoading ? (
                            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                          ) : (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )) : renderPlaceholder('No images yet', 'Upload a screenshot, moodboard, or diagram to preview it here.')}
              </div>
            </div>

            <div className="glass-panel-light p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">PDF documents</h3>
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">{pdfs.length} ready</span>
              </div>
              <div className="mt-4 space-y-2">
                {pdfs.length ? pdfs.map(file => (
                  <div key={file.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-3 py-2 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{file.name}</p>
                      <p className="text-[11px] text-white/40">{file.size}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="rounded-full bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-violet-200">PDF</span>
                      <button
                        onClick={() => analyzeUploadedFile(file)}
                        disabled={uploadAnalysisLoading}
                        className="w-6 h-6 rounded-full bg-cyan-400/15 border border-cyan-400/25 flex items-center justify-center text-cyan-300 hover:bg-cyan-400/40 hover:text-white hover:border-cyan-400/50 transition-all disabled:opacity-40 opacity-0 group-hover:opacity-100"
                        title="Analyze with AI"
                      >
                        {uploadAnalysisLoading ? (
                          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                        ) : (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="w-6 h-6 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/40 hover:bg-rose-500/80 hover:text-white hover:border-rose-400/50 transition-all opacity-0 group-hover:opacity-100"
                        title="Remove PDF"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )) : renderPlaceholder('No PDFs yet', 'Upload spec sheets, contracts, or notes to access them instantly.')}
              </div>
            </div>
          </div>

          {/* Inline Analysis Panel */}
          {(uploadAnalysisOutput || uploadAnalysisLoading) && (
            <div ref={analysisPanelRef} className="glass-panel-light p-4 rounded-2xl border border-cyan-400/20 animate-fadeInUp">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">🔍 AI Analysis</span>
                  {analyzedFileName && (
                    <span className="text-[10px] text-white/40 font-mono truncate max-w-[200px]">{analyzedFileName}</span>
                  )}
                </div>
                {!uploadAnalysisLoading && (
                  <button
                    onClick={() => {
                      setUploadAnalysisOutput('');
                      setAnalyzedFileName('');
                    }}
                    className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4 min-h-[120px] max-h-[300px] overflow-y-auto">
                {uploadAnalysisLoading ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-cyan-200 mb-3">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
                      Analyzing file...
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full skeleton rounded" />
                      <div className="h-3 w-5/6 skeleton rounded" />
                      <div className="h-3 w-4/6 skeleton rounded" />
                      <div className="h-3 w-full skeleton rounded" />
                      <div className="h-3 w-3/4 skeleton rounded" />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed space-y-1">
                    {renderFormattedContent(uploadAnalysisOutput)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );

    case 'documents':
      return (
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-cyan-400/20">
            <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/70">Document workspace</p>
            <h2 className="text-xl font-semibold text-white">Shared assets and references</h2>
            <p className="mt-2 text-sm text-white/60">Keep the latest screenshots, files, and product notes grouped by project.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="glass-panel-light p-4 rounded-2xl border border-white/10">
              <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">Images</p>
              <p className="mt-2 text-3xl font-semibold text-white">{images.length}</p>
              <p className="mt-1 text-sm text-white/60">Visual references and mockups</p>
            </div>
            <div className="glass-panel-light p-4 rounded-2xl border border-white/10">
              <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">PDFs</p>
              <p className="mt-2 text-3xl font-semibold text-white">{pdfs.length}</p>
              <p className="mt-1 text-sm text-white/60">Reports, specs, and handoff notes</p>
            </div>
            <div className="glass-panel-light p-4 rounded-2xl border border-white/10">
              <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">Sync state</p>
              <p className="mt-2 text-3xl font-semibold text-white">Live</p>
              <p className="mt-1 text-sm text-white/60">Everything stays connected to the workspace</p>
            </div>
          </div>
        </div>
      );

    case 'screen-share':
      return (
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-cyan-400/20">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/70">Screen sharing</p>
                <h2 className="text-xl font-semibold text-white">Share your screen with Nova</h2>
                <p className="mt-2 text-sm text-white/60">Grant screen access, capture screenshots, and ask the AI to analyze what's on your display.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    if (shareStream) {
                      shareStream.getTracks().forEach(track => track.stop());
                      setShareStream(null);
                      setIsSharing(false);
                      return;
                    }

                    try {
                      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
                      setShareStream(stream);
                      setIsSharing(true);
                      setAnalysisOutput('');
                      setCaptureError('');

                      const track = stream.getVideoTracks()[0];
                      track.onended = () => {
                        setIsSharing(false);
                        setShareStream(null);
                      };
                    } catch (error) {
                      setCaptureError('Screen sharing is unavailable or permission was denied.');
                    }
                  }}
                  className={`rounded-xl px-4 py-2 text-sm transition ${isSharing ? 'bg-rose-500/15 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'}`}
                >
                  {isSharing ? '■ Stop sharing' : '● Start screen share'}
                </button>
                <button
                  onClick={captureScreenshot}
                  disabled={!isSharing}
                  className={`rounded-xl border px-4 py-2 text-sm transition ${
                    isSharing
                      ? 'border-cyan-400/25 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                      : 'border-white/10 bg-white/5 text-white/40 cursor-not-allowed'
                  }`}
                >
                  📸 Capture screenshot
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
            {/* Live preview column */}
            <div className="space-y-4">
              <div className="glass-panel-light p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Live preview</h3>
                  <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.25em] ${isSharing ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-white/40'}`}>
                    {isSharing ? '● Active' : '○ Inactive'}
                  </span>
                </div>
                <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-3">
                  {shareStream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-72 w-full rounded-3xl bg-black/40 object-cover"
                    />
                  ) : (
                    <div className="flex h-72 items-center justify-center rounded-3xl bg-white/5 text-center text-sm text-white/50">
                      {captureError || 'No screen is shared yet. Click "Start screen share" to begin.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Captured screenshot preview */}
              {capturedScreenshot && (
                <div className="glass-panel-light p-4 rounded-2xl border border-cyan-400/20 animate-fadeInUp">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">📸 Captured screenshot</h3>
                    <span className="text-[10px] text-white/40 font-mono">{capturedScreenshot.size}</span>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <img
                      src={capturedScreenshot.preview}
                      alt="Screen capture"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={async () => {
                        if (!capturedScreenshot) return;
                        setAnalysisLoading(true);
                        setAnalysisOutput('Nova is analyzing your screenshot...');

                        try {
                          // Convert the blob URL to base64 for API transmission
                          let screenshotBase64 = '';
                          if (capturedScreenshot.preview) {
                            const response = await fetch(capturedScreenshot.preview);
                            const blob = await response.blob();
                            screenshotBase64 = await new Promise<string>((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onloadend = () => resolve(reader.result as string);
                              reader.onerror = reject;
                              reader.readAsDataURL(blob);
                            });
                          }

                          const apiResponse = await fetch('/api/nova-chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              content: 'Analyze this screenshot in detail. Describe what you see, identify UI elements, layout, content, text, colors, and any notable features. Be thorough and organized.',
                              files: [{
                                id: capturedScreenshot.id,
                                name: capturedScreenshot.name,
                                type: 'image',
                                size: capturedScreenshot.size,
                                preview: capturedScreenshot.preview,
                              }],
                              screenshotBase64,
                            }),
                          });

                          if (apiResponse.ok) {
                            const data = await apiResponse.json();
                            if (typeof data?.content === 'string' && data.content.trim()) {
                              setAnalysisOutput(data.content);
                            } else {
                              throw new Error('Empty response');
                            }
                          } else {
                            throw new Error('API error');
                          }
                        } catch {
                          // API unavailable — show config error
                          setAnalysisOutput(
                            'Nova API is not available.\n\nMake sure you have NOVA_API_KEY set in .env.local. Without it, the AI cannot analyze screenshots.'
                          );
                        }

                        setAnalysisLoading(false);
                      }}
                      className="flex-1 rounded-xl border border-cyan-400/25 bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/25"
                    >
                      🔍 Analyze with AI
                    </button>
                    <button
                      onClick={async () => {
                        if (!capturedScreenshot?.preview) return;

                        // Download the screenshot
                        const link = document.createElement('a');
                        link.href = capturedScreenshot.preview;
                        link.download = capturedScreenshot.name;
                        link.click();
                      }}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50 transition hover:bg-white/10"
                      title="Download screenshot"
                    >
                      ⬇
                    </button>
                    <button
                      onClick={() => {
                        setCapturedScreenshot(null);
                      }}
                      className="rounded-xl border border-rose-500/15 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis column */}
            <div className="glass-panel-light p-4 rounded-2xl border border-white/10 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Analysis</h3>
                {analysisOutput && !analysisLoading && (
                  <button
                    onClick={() => setAnalysisOutput('')}
                    className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4 min-h-[260px] flex-1 overflow-y-auto">
                <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/70 mb-3">
                  {capturedScreenshot ? 'Screenshot AI insights' : 'AI insights'}
                </p>

                {analysisLoading ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-cyan-200 mb-3">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
                      Analyzing screenshot...
                    </div>
                    {/* Skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 w-full skeleton rounded" />
                      <div className="h-3 w-5/6 skeleton rounded" />
                      <div className="h-3 w-4/6 skeleton rounded" />
                      <div className="h-3 w-full skeleton rounded" />
                      <div className="h-3 w-3/4 skeleton rounded" />
                      <div className="h-3 w-5/6 skeleton rounded" />
                    </div>
                  </div>
                ) : analysisOutput ? (
                  <div className="text-sm leading-relaxed space-y-1">
                    {renderFormattedContent(analysisOutput)}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📷</div>
                    <p className="text-sm text-white/50 leading-relaxed">
                      {capturedScreenshot
                        ? 'Click "Analyze with AI" to get insights about your screenshot.'
                        : 'Share your screen and capture a screenshot, then ask Nova to analyze what it sees.'}
                    </p>
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                      <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/40">1. Start sharing</span>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/40">
                        {isSharing ? '2. 📸 Capture' : '2. Capture'}
                      </span>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/40">3. Analyze</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Screenshot history strip */}
          {screenshots.length > 0 && (
            <div className="glass-panel-light p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Screenshot history</h3>
                <span className="text-[10px] text-white/40 font-mono">{screenshots.length} captures</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {screenshots.map((shot, idx) => (
                  <button
                    key={shot.id}
                    onClick={() => setCapturedScreenshot(shot)}
                    className={`flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      capturedScreenshot?.id === shot.id
                        ? 'border-cyan-400/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                        : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="w-24 h-16 bg-black/40">
                      {shot.preview && (
                        <img src={shot.preview} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="px-1.5 py-1 text-[8px] text-white/40 text-center">
                      #{idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 'analytics':
      return (
        <div className="max-w-6xl mx-auto">
          <div className="glass-panel p-6 rounded-3xl border border-cyan-400/20">
            <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/70">Analytics</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Live workspace metrics</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {renderPlaceholder('Throughput', 'Monitor upload, share, and collaboration activity in real time.')}
              {renderPlaceholder('Engagement', 'Track which files and sessions are getting the most attention.')}
              {renderPlaceholder('Health', 'Stay ahead of sync issues and bandwidth spikes.')}
            </div>
          </div>
        </div>
      );

    case 'devices':
      return (
        <div className="max-w-6xl mx-auto">
          <div className="glass-panel p-6 rounded-3xl border border-cyan-400/20">
            <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/70">Devices</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Connected hardware and endpoints</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {renderPlaceholder('Lens camera', 'Camera preview and capture controls are ready.')}
              {renderPlaceholder('Audio hub', 'Voice and speaker routing options are available.')}
            </div>
          </div>
        </div>
      );

    case 'calendar':
      return (
        <div className="max-w-6xl mx-auto">
          <div className="glass-panel p-6 rounded-3xl border border-cyan-400/20">
            <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/70">Calendar</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Upcoming reviews and launches</h2>
            <div className="mt-4 space-y-2">
              {['09:00 — Design review', '13:30 — Client sync', '16:00 — Share session'].map(item => (
                <div key={item} className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-sm text-white/70">{item}</div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'settings':
      return (
        <div className="max-w-6xl mx-auto">
          <div className="glass-panel p-6 rounded-3xl border border-cyan-400/20">
            <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/70">Settings</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Workspace preferences</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {renderPlaceholder('Automation', 'Tune upload rules and session defaults.')}
              {renderPlaceholder('Notifications', 'Choose what should pop up during collaboration.')}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
