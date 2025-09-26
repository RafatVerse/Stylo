import React, { useState, useEffect, useCallback, useRef } from 'react';

// Components
import { Header } from './components/Header';
import { ImageInput } from './components/ImageInput';
import { SelectDropdown } from './components/SelectDropdown';
import { HistorySidebar } from './components/HistorySidebar';
import { GeneratingDisplay } from './components/GeneratingDisplay';
import { FullScreenLoader } from './components/FullScreenLoader';
import { MoodModal } from './components/MoodModal';
import { Icon } from './components/Icon';

// Services and Utils
import {
  editImageWithGemini,
  generatePromptFromImage,
  generateMagicPrompt,
} from './services/geminiService';
import { resizeImageBase64 } from './utils/imageUtils';

// Types
import type { UploadedImage, HistoryItem } from './types';

const ASPECT_RATIOS = ['1:1', '4:3', '3:4', '16:9', '9:16'] as const;
const MOODS = [
  'Cinematic', 'Minimalist', 'Vibrant & Colorful', 'Dark & Moody',
  'Futuristic', 'Vintage', 'Natural & Earthy', 'Luxurious & Elegant',
  'Playful & Whimsical', 'Abstract & Surreal', 'Cozy & Warm', 'Industrial & Gritty'
] as const;
const LIGHTING_STYLES = ["Soft Studio", "Golden Hour", "Dramatic", "Cinematic", "Natural Daylight", "Backlit"] as const;
const CAMERA_PERSPECTIVES = ["Eye-level", "High-angle", "Low-angle", "Macro Shot", "Dutch Angle", "Top-down"] as const;


const App: React.FC = () => {
    // State for inputs
    const [productImage, setProductImage] = useState<UploadedImage | null>(null);
    const [referenceImage, setReferenceImage] = useState<UploadedImage | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<string>(ASPECT_RATIOS[0]);
    const [lightingStyle, setLightingStyle] = useState<string>(LIGHTING_STYLES[0]);
    const [cameraPerspective, setCameraPerspective] = useState<string>(CAMERA_PERSPECTIVES[0]);

    // State for UI and processes
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [generationTime, setGenerationTime] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [processingMessage, setProcessingMessage] = useState<string>('');
    const [isMoodModalOpen, setIsMoodModalOpen] = useState<boolean>(false);
    
    const generationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('stylo-history');
            if (savedHistory) setHistory(JSON.parse(savedHistory));
        } catch (e) {
            console.error("Failed to load history from localStorage", e);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('stylo-history', JSON.stringify(history));
        } catch (e) {
            if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                console.warn("Could not save history to localStorage because the quota has been exceeded. Please consider clearing some history items.");
                setError("Storage is full. Please clear some history to save new items.");
            } else {
                console.error("Failed to save history to localStorage", e);
            }
        }
    }, [history]);
    
    useEffect(() => {
        if (isGenerating) {
            setGenerationTime(0);
            generationIntervalRef.current = setInterval(() => setGenerationTime(prev => prev + 1), 1000);
        } else if (generationIntervalRef.current) {
            clearInterval(generationIntervalRef.current);
            generationIntervalRef.current = null;
        }
        return () => {
            if (generationIntervalRef.current) clearInterval(generationIntervalRef.current);
        };
    }, [isGenerating]);


    const handleGenerate = useCallback(async () => {
        if (!productImage) {
            setError('Please upload a product image.');
            return;
        }
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }

        setError(null);
        setIsGenerating(true);
        setGeneratedImage(null);
        setSelectedHistoryId(null);
        
        try {
            const resultBase64 = await editImageWithGemini(
                prompt,
                { data: productImage.base64, mimeType: productImage.mimeType },
                referenceImage ? { data: referenceImage.base64, mimeType: referenceImage.mimeType } : null,
                aspectRatio,
                lightingStyle,
                cameraPerspective
            );
            
            setGeneratedImage(resultBase64);

            const thumbnail = await resizeImageBase64(resultBase64, 'image/png', 200);
            const preview = await resizeImageBase64(resultBase64, 'image/png', 1024);
            const newHistoryItem: HistoryItem = {
                id: new Date().toISOString() + Math.random(),
                prompt,
                previewImage: preview,
                thumbnail,
                productImage: { base64: productImage.base64, mimeType: productImage.mimeType },
                referenceImage: referenceImage ? { base64: referenceImage.base64, mimeType: referenceImage.mimeType } : null,
                aspectRatio,
                lightingStyle,
                cameraPerspective,
                createdAt: new Date().toISOString(),
            };
            setHistory(prev => [newHistoryItem, ...prev]);
            setSelectedHistoryId(newHistoryItem.id);

        } catch (e: any) {
            console.error(e);
            setError(e.message || 'An unexpected error occurred during image generation.');
        } finally {
            setIsGenerating(false);
        }
    }, [productImage, referenceImage, prompt, aspectRatio, lightingStyle, cameraPerspective]);
    
    const handleUseReferenceAsPrompt = useCallback(async () => {
        if (!referenceImage) return;
        setIsProcessing(true);
        setProcessingMessage('Analyzing reference image...');
        setError(null);
        try {
            const generatedPrompt = await generatePromptFromImage({ data: referenceImage.base64, mimeType: referenceImage.mimeType });
            setPrompt(generatedPrompt);
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Failed to generate prompt from reference image.');
        } finally {
            setIsProcessing(false);
        }
    }, [referenceImage]);
    
    const handleSelectMood = useCallback(async (mood: string) => {
        setIsMoodModalOpen(false);
        if (!productImage) {
            setError('Please upload a product image first to use Magic Prompt.');
            return;
        };
        setIsProcessing(true);
        setProcessingMessage(`Generating '${mood}' prompt...`);
        setError(null);
        try {
            const magicPrompt = await generateMagicPrompt({ data: productImage.base64, mimeType: productImage.mimeType }, mood);
            setPrompt(magicPrompt);
        } catch(e: any) {
            console.error(e);
            setError(e.message || 'Failed to generate magic prompt.');
        } finally {
            setIsProcessing(false);
        }
    }, [productImage]);
    
    const handleHistorySelect = useCallback((id: string) => {
        const item = history.find(h => h.id === id);
        if (item) {
            setProductImage({ base64: item.productImage.base64, mimeType: item.productImage.mimeType });
            setReferenceImage(item.referenceImage ? { base64: item.referenceImage.base64, mimeType: item.referenceImage.mimeType } : null);
            setPrompt(item.prompt);
            setAspectRatio(item.aspectRatio);
            setLightingStyle(item.lightingStyle);
            setCameraPerspective(item.cameraPerspective);
            setGeneratedImage(item.previewImage);
            setSelectedHistoryId(id);
            setIsHistoryOpen(false);
        }
    }, [history]);

    const handleHistoryDelete = useCallback((id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));
        if (selectedHistoryId === id) setSelectedHistoryId(null);
    }, [selectedHistoryId]);
    
    const handleClearHistory = useCallback(() => {
        if (window.confirm('Are you sure you want to delete all history? This cannot be undone.')) {
            setHistory([]);
            setSelectedHistoryId(null);
        }
    }, []);

    const clearForm = () => {
        setProductImage(null);
        setReferenceImage(null);
        setPrompt('');
        setAspectRatio(ASPECT_RATIOS[0]);
        setLightingStyle(LIGHTING_STYLES[0]);
        setCameraPerspective(CAMERA_PERSPECTIVES[0]);
        setGeneratedImage(null);
        setError(null);
        setSelectedHistoryId(null);
    };

    const handleDownload = (resolution: '2K' | '4K' | '8K') => {
        if (!generatedImage) return;

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            const [w, h] = aspectRatio.split(':').map(Number);
            let targetWidth;
            switch(resolution) {
                case '4K': targetWidth = 3840; break;
                case '8K': targetWidth = 7680; break;
                case '2K': default: targetWidth = 2048; break;
            }
            
            canvas.width = targetWidth;
            canvas.height = (targetWidth / w) * h;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `stylo-mockup-${resolution}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        img.src = `data:image/png;base64,${generatedImage}`;
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white font-sans">
            <Header onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)} />
            
            <main className="container mx-auto p-4 md:p-8 flex flex-col items-center gap-8">
                
                {/* Display Area & Downloads */}
                <div className="w-full max-w-4xl">
                    <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800 flex items-center justify-center aspect-video relative">
                        {generatedImage ? (
                            <img 
                                src={`data:image/png;base64,${generatedImage}`}
                                alt="Generated product mockup"
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        ) : (
                            <div className="text-center text-gray-500">
                                <Icon path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" className="mx-auto h-20 w-20" />
                                <p className="mt-4 text-lg">Your generated image will appear here</p>
                            </div>
                        )}
                    </div>
                    {generatedImage && (
                        <div className="mt-4 flex justify-center items-center gap-2 sm:gap-4">
                            {(['2K', '4K', '8K'] as const).map(res => (
                                <button
                                    key={res}
                                    onClick={() => handleDownload(res)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
                                >
                                    <Icon path="M3 17v2h18v-2H3zm16-4l-1.41-1.41L13 16.17V4h-2v12.17l-4.59-4.58L5 13l7 7 7-7z" className="w-5 h-5"/>
                                    Download {res}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Control Panel */}
                <div className="flex flex-col gap-6 bg-gray-950/50 p-6 rounded-xl border border-gray-800 w-full max-w-4xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Create your mockup</h2>
                        <button
                            onClick={clearForm}
                            className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition"
                            aria-label="Start new session"
                        >
                            <Icon path="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" className="w-4 h-4" />
                            New Session
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !productImage || !prompt}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
                        >
                           <Icon path="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" className="w-5 h-5"/>
                            Generate Mockup
                        </button>
                         <button 
                            onClick={() => setIsMoodModalOpen(true)}
                            disabled={!productImage}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
                        >
                            <Icon path="M12 2.5C7.25 2.5 3.5 6.25 3.5 11C3.5 13.1217 4.34285 15.1565 5.80762 16.6213C7.27239 18.0861 9.30718 18.9286 11.4286 18.9286C11.6652 18.9286 11.9018 18.9107 12.1384 18.8839L12.5 18.8571L12.875 19.25L15.375 21.75L16.25 20.875L13.75 18.375L13.3571 18L13.3839 17.6339C13.6071 15.6518 14.5 13.8393 16.25 12.5C18.125 11.125 18.5 8.625 18.5 7.75C18.5 4.875 15.625 2.5 12 2.5ZM12 4.25C14.75 4.25 16.75 6.125 16.75 7.75C16.75 8.375 16.5 10.125 15.125 11.125C13.875 12 12.5 12.75 11.875 14.375C11.5 15.5 11.25 16.75 11.5 17.125C11.625 17.25 11.75 17.125 12 17.125C12.125 17.125 12.25 17.125 12.375 17.125C10.5 17.125 8.75 16.375 7.5 15.125C6.25 13.875 5.5 12.25 5.5 10.625C5.5 7.25 8.375 4.25 12 4.25Z" className="w-5 h-5"/>
                            Magic Prompt ✨
                        </button>
                    </div>
                    
                    <div>
                       <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                            Prompt <span className="text-red-400">*</span>
                       </label>
                       <textarea
                            id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., on a marble countertop with a blurred kitchen background, warm morning light"
                            rows={3}
                            className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                       />
                    </div>

                    <div className="border-t border-gray-800 pt-6">
                        <h3 className="text-xl font-semibold mb-4">Scene Style</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <SelectDropdown label="Aspect Ratio" options={ASPECT_RATIOS} value={aspectRatio} onChange={setAspectRatio} placeholder="Select an aspect ratio" />
                           <SelectDropdown label="Lighting Style" options={LIGHTING_STYLES} value={lightingStyle} onChange={setLightingStyle} placeholder="Select a lighting style" />
                           <SelectDropdown label="Camera Perspective" options={CAMERA_PERSPECTIVES} value={cameraPerspective} onChange={setCameraPerspective} placeholder="Select a camera perspective" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <ImageInput label="Product Image" id="product-image" image={productImage} onImageChange={setProductImage} onImageRemove={() => setProductImage(null)} required />
                            <ImageInput label="Style Reference (Optional)" id="reference-image" image={referenceImage} onImageChange={setReferenceImage} onImageRemove={() => setReferenceImage(null)} />
                        </div>
                         {referenceImage && (
                            <button onClick={handleUseReferenceAsPrompt} className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-indigo-400 hover:bg-indigo-900/50 py-2 rounded-lg transition-colors border border-indigo-700/50">
                                <Icon path="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" className="w-5 h-5"/>
                                Analyze Style & Generate Prompt
                            </button>
                        )}
                    </div>
                    
                    {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>}
                </div>
            </main>

            <HistorySidebar isOpen={isHistoryOpen} history={history} selectedHistoryId={selectedHistoryId} onSelect={handleHistorySelect} onDelete={handleHistoryDelete} onClearAll={handleClearHistory} onClose={() => setIsHistoryOpen(false)} />
            <GeneratingDisplay isOpen={isGenerating} elapsedTime={generationTime} />
            <FullScreenLoader isOpen={isProcessing} message={processingMessage} />
            <MoodModal isOpen={isMoodModalOpen} onClose={() => setIsMoodModalOpen(false)} onSelectMood={handleSelectMood} moods={MOODS} />
        </div>
    );
};

export default App;