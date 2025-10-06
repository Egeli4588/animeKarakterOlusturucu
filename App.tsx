/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useRef } from 'react';
import { convertToAnime } from './services/geminiService';
import CameraView, { CameraViewHandles } from './components/CameraView';
import { DownloadIcon, CameraIcon, SwitchCameraIcon } from './components/icons';

type AppState = 'camera' | 'processing' | 'result';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<CameraViewHandles>(null);

  const handleCapture = async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setAppState('processing');
    setError(null);
    setProcessedImage(null);

    try {
      const imageParts = imageDataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.*)$/);
      if (!imageParts || imageParts.length !== 3) {
        throw new Error("Kameradan geçersiz resim formatı alındı.");
      }
      const mimeType = imageParts[1];
      const base64Image = imageParts[2];

      const animeImageUrl = await convertToAnime(base64Image, mimeType);
      if (animeImageUrl) {
        setProcessedImage(animeImageUrl);
      } else {
        throw new Error("Modelden resim alınamadı.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
      setError(`Dönüştürme başarısız oldu: ${errorMessage}`);
    } finally {
      setAppState('result');
    }
  };

  const handleRetake = () => {
    setAppState('camera');
    setCapturedImage(null);
    setProcessedImage(null);
    setError(null);
  };
  
  const handleDownloadClick = () => {
    if (!processedImage) return;
    const a = document.createElement('a');
    a.href = processedImage;
    a.download = 'anime-karakterim.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const ImageBox: React.FC<{ imageUrl: string | null; title: string; isLoading?: boolean }> = ({ imageUrl, title, isLoading: loading }) => (
    <div className="w-full md:w-1/2 flex flex-col items-center">
      <div className="w-full max-w-md aspect-square bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-700 overflow-hidden">
        {loading ? (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-400" role="status" aria-label="Yükleniyor"></div>
        ) : imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
        ) : (
          <span className="text-gray-500">{title}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Anime Karakter Yaratıcısı</h1>
        <p className="text-lg text-gray-400 mb-8">Yapay zeka ile kendinizi bir anime karakterine dönüştürün!</p>

        {appState === 'camera' && (
          <div className="w-full max-w-lg mx-auto">
            <CameraView ref={cameraRef} onCapture={handleCapture} onError={setError} />
            <div className="flex justify-center items-center gap-4 mt-6">
                <button
                    onClick={() => cameraRef.current?.flipCamera()}
                    className="p-4 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-indigo-500"
                    aria-label="Kamerayı değiştir"
                >
                    <SwitchCameraIcon className="w-8 h-8" />
                </button>
                <button
                    onClick={() => cameraRef.current?.capture()}
                    className="p-6 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-indigo-500 transform hover:scale-105"
                    aria-label="Fotoğraf çek"
                >
                    <CameraIcon className="w-10 h-10" />
                </button>
                 {/* Dummy button to balance flex layout */}
                <div className="p-4 w-[72px] h-[72px]"></div>
            </div>
          </div>
        )}

        {(appState === 'processing' || appState === 'result') && (
            <>
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-8">
                    <ImageBox imageUrl={capturedImage} title="Orijinal Resim" />
                    <ImageBox imageUrl={processedImage} title="Anime Karakter" isLoading={appState === 'processing'} />
                </div>
            </>
        )}
        
        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 max-w-2xl mx-auto" role="alert">
                <strong className="font-bold">Hata!</strong>
                <span className="block sm:inline ml-2">{error}</span>
            </div>
        )}

        {appState === 'result' && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
                onClick={handleRetake}
                className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-500 transition-colors duration-300 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-indigo-500"
                aria-label="Yeni bir fotoğraf çek"
            >
                Yeni Fotoğraf Çek
            </button>
            
            <button
                onClick={handleDownloadClick}
                disabled={!processedImage}
                className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-500 transition-colors duration-300 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                aria-label="Anime karakterini indir"
            >
                <DownloadIcon className="w-6 h-6 mr-3" />
                İndir
            </button>
            </div>
        )}
      </div>
      <footer className="w-full shrink-0 p-4 text-center text-gray-600 text-xs mt-8">
        Gemini 2.5 Flash Image Modeli ile güçlendirilmiştir.
      </footer>
    </div>
  );
};

export default App;