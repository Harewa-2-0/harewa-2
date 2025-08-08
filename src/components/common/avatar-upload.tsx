'use client';

import { Camera, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

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

  const open = () => inputRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    setBusy(true);
    try {
      await onUpload(f);
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
        className="absolute bottom-0 right-0 p-2 rounded-full bg-white border shadow"
        aria-label="Change photo"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={onChange} className="hidden" />
    </div>
  );
}
