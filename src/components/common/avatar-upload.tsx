'use client';

import { Camera, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import ImageCropModal from './image-crop-modal';

export default function AvatarUpload({
  src,
  size = 96,
  onUpload,
}: {
  src?: string;
  size?: number;
  onUpload: (file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const open = () => inputRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    // Show crop modal instead of immediate upload
    setSelectedFile(f);
    setShowCropModal(true);
    
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleCrop = async (croppedFile: File) => {
    setPreview(URL.createObjectURL(croppedFile));
    setBusy(true);
    try {
      await onUpload(croppedFile);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative inline-block">
      <img
        src={preview || src || '/avatar_placeholder.png'}
        alt="Profile image"
        className="rounded-full object-cover border"
        style={{ width: size, height: size }}
      />
      <button
        type="button"
        onClick={open}
        className="absolute cursor-pointer bottom-0 right-0 p-2 rounded-full bg-white border shadow hover:bg-gray-50 transition-colors"
        aria-label="Change photo"
        disabled={busy}
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={onChange} className="hidden" />
      
      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        onCrop={handleCrop}
        imageFile={selectedFile}
      />
    </div>
  );
}
