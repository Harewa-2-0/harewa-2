// Currently: dragging/panning the image resets because a new object URL was created on each render
// and mouse events lacked pointer capture, letting ReactCrop intercept/lose the gesture.
// Fix: use a stable object URL + pointer events with capture, and add touchAction/willChange.

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, RotateCw, ZoomIn, ZoomOut, Check } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrop: (croppedImage: File) => void;
  imageFile: File | null;
}

export default function ImageCropModal({ isOpen, onClose, onCrop, imageFile }: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageUrl, setImageUrl] = useState<string>('');
  
  const imgRef = useRef<HTMLImageElement>(null);

  // Stable object URL for imageFile + reset transforms when a new image arrives
  useEffect(() => {
    if (!imageFile) {
      setImageUrl('');
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);

    setScale(1);
    setRotate(0);
    setTranslateX(0);
    setTranslateY(0);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop(
        { unit: '%', width: 100 },
        1, // 1:1 aspect ratio for profile pictures
        width,
        height
      ),
      width,
      height
    );
    setCrop(initial);
  }, []);

  // Pointer-based pan handlers with capture so the gesture persists
  const handlePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    setDragStart({ x: e.clientX - translateX, y: e.clientY - translateY });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!isDragging) return;
    setTranslateX(e.clientX - dragStart.x);
    setTranslateY(e.clientY - dragStart.y);
  };

  const endPointer = (e: React.PointerEvent<HTMLImageElement>) => {
    setIsDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  const handleCrop = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { setIsProcessing(false); return; }

      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) { setIsProcessing(false); return; }
        const croppedFile = new File([blob], imageFile?.name || 'cropped-image.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        onClose();
        onCrop(croppedFile);
      }, 'image/jpeg', 0.9);
    } catch (err) {
      console.error('Error cropping image:', err);
      setIsProcessing(false);
    }
  };

  const resetImage = () => {
    setScale(1);
    setRotate(0);
    setTranslateX(0);
    setTranslateY(0);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const c = centerCrop(
        makeAspectCrop({ unit: '%', width: 100 }, 1, width, height),
        width,
        height
      );
      setCrop(c);
    }
  };

  if (!isOpen || !imageFile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Crop Profile Picture</h3>
            <p className="text-sm text-gray-600">Drag to position, use zoom and rotate to get the perfect crop</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Image Crop Area - Fixed Height */}
        <div className="h-96 p-4 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Drag image to reposition • Use scroll to zoom • Drag crop area to adjust</p>
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                  minWidth={100}
                  minHeight={100}
                  className="max-w-full"
                >
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Crop preview"
                    style={{
                      transform: `scale(${scale}) rotate(${rotate}deg) translate(${translateX}px, ${translateY}px)`,
                      maxHeight: '250px',
                      maxWidth: '100%',
                      cursor: isDragging ? 'grabbing' : 'grab',
                      touchAction: 'none',
                      willChange: 'transform',
                    }}
                    onLoad={onImageLoad}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endPointer}
                    onPointerCancel={endPointer}
                    className="max-h-64 object-contain select-none"
                    draggable={false}
                  />
                </ReactCrop>
              </div>
            </div>
            
            {/* Controls and Preview Layout */}
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              {/* Controls - Left Side */}
              <div className="flex-1 space-y-3">
                {/* Scale Control */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zoom: {Math.round(scale * 100)}%
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                      className="p-2 hover:bg-yellow-100 rounded-full transition-colors"
                      disabled={scale <= 0.5}
                    >
                      <ZoomOut size={16} />
                    </button>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <button
                      onClick={() => setScale(Math.min(3, scale + 0.1))}
                      className="p-2 hover:bg-yellow-100 rounded-full transition-colors"
                      disabled={scale >= 3}
                    >
                      <ZoomIn size={16} />
                    </button>
                  </div>
                </div>

                {/* Rotation Control */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotate: {rotate}°
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setRotate(rotate - 90)}
                      className="p-2 hover:bg-yellow-100 rounded-full transition-colors"
                    >
                      <RotateCw size={16} />
                    </button>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="15"
                      value={rotate}
                      onChange={(e) => setRotate(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <button
                      onClick={() => setRotate(rotate + 90)}
                      className="p-2 hover:bg-yellow-100 rounded-full transition-colors"
                    >
                      <RotateCw size={16} className="rotate-180" />
                    </button>
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetImage}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset to original
                </button>
              </div>

              {/* Crop Preview - Desktop Only */}
              {completedCrop && (
                <div className="hidden md:block flex-shrink-0">
                  <p className="text-sm text-gray-600 mb-2 text-center">Crop Preview</p>
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-500">
                    <canvas
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover"
                      ref={(canvas) => {
                        if (canvas && imgRef.current && completedCrop) {
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
                            const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
                            ctx.clearRect(0, 0, 80, 80);
                            ctx.drawImage(
                              imgRef.current,
                              completedCrop.x * scaleX,
                              completedCrop.y * scaleY,
                              completedCrop.width * scaleX,
                              completedCrop.height * scaleY,
                              0,
                              0,
                              80,
                              80
                            );
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Compact with Zoom Bar */}
        <div className="flex items-center justify-between gap-3 p-4 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-4">
            {/* Quick Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setScale(Math.max(0.5, scale - 0.2))}
                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm"
                disabled={scale <= 0.5}
              >
                -
              </button>
              <button
                onClick={() => setScale(Math.min(3, scale + 0.2))}
                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm"
                disabled={scale >= 3}
              >
                +
              </button>
            </div>
            
            <button
              onClick={handleCrop}
              disabled={!completedCrop || isProcessing}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={16} />
                  Apply Crop
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
