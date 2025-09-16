'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/contexts/toast-context';
import { colorHexToName } from './utils';
import { type Fabric } from './FabricsTable';

interface EditFabricModalProps {
  isOpen: boolean;
  onClose: () => void;
  fabric: Fabric;
  onSuccess?: (updated: Fabric) => void;
}

export default function EditFabricModal({ isOpen, onClose, fabric, onSuccess }: EditFabricModalProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [colorHex, setColorHex] = useState('#000080');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    color: '',
    pattern: '',
    weight: '',
    width: '',
    composition: '',
    supplier: '',
    pricePerMeter: '',
    inStock: true,
    widthUnit: 'cm',
  });
  const [step, setStep] = useState(1);

  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && fabric) {
      setFormData({
        name: fabric.name || '',
        type: fabric.type || '',
        color: fabric.color || '',
        pattern: fabric.pattern || '',
        weight: fabric.weight?.toString() || '',
        width: fabric.width?.toString() || '',
        composition: fabric.composition || '',
        supplier: fabric.supplier || '',
        pricePerMeter: fabric.pricePerMeter?.toString() || '',
        inStock: Boolean(fabric.inStock),
        widthUnit: 'cm',
      });
      setColorHex('#000080');
      setStep(1);
    }
  }, [isOpen, fabric]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, color: colorHexToName(colorHex) }));
  }, [colorHex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const canProceedFromStep = (s: number) => {
    if (s === 1) {
      return formData.name.trim().length > 0 && formData.type.trim().length > 0;
    }
    if (s === 2) return true;
    if (s === 3) {
      const price = formData.pricePerMeter ? Number(formData.pricePerMeter) : 0;
      return !(Number.isNaN(price) || price < 0);
    }
    return true;
  };

  const nextStep = () => {
    if (!canProceedFromStep(step)) {
      addToast('Please complete required fields on this step.', 'error');
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    const type = formData.type.trim();
    if (!name || !type) {
      addToast('Please fill required fields: name and type.', 'error');
      setStep(1);
      return;
    }
    setIsLoading(true);
    try {
      // UI-only feedback for now
      const updated: Fabric = {
        ...fabric,
        name: formData.name,
        type: formData.type,
        color: formData.color,
        pattern: formData.pattern,
        weight: formData.weight ? Number(formData.weight) : undefined,
        width: formData.width ? Number(formData.width) : undefined,
        composition: formData.composition,
        supplier: formData.supplier,
        pricePerMeter: formData.pricePerMeter ? Number(formData.pricePerMeter) : undefined,
        inStock: formData.inStock,
        updatedAt: new Date().toISOString(),
      };
      onSuccess?.(updated);
      addToast('Fabric updated (UI only).', 'success');
      onClose();
    } catch (error: any) {
      addToast(error?.message || 'Failed to update fabric.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="edit-fabric-modal-title"
    >
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 id="edit-fabric-modal-title" className="text-xl font-semibold text-gray-900">Edit Fabric</h2>
            <button onClick={onClose} disabled={isLoading} aria-label="Close" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            {['Basic', 'Specifications', 'Pricing & Stock', 'Review'].map((label, idx) => {
              const n = idx + 1;
              const active = step === n;
              const completed = step > n;
              return (
                <div key={label} className="flex-1 flex items-center">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium mr-2 ${completed ? 'bg-[#D4AF37] text-white' : active ? 'border-2 border-[#D4AF37] text-[#D4AF37]' : 'bg-gray-100 text-gray-600'}`}>{n}</div>
                  <span className={`text-sm ${active ? 'text-gray-900' : 'text-gray-500'}`}>{label}</span>
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]" required />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <input id="type" name="type" type="text" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex items-center space-x-3">
                  <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="h-10 w-12 p-1 border border-gray-300 rounded" />
                  <input type="text" name="color" value={formData.color} onChange={handleInputChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]" required />
                </div>
                <p className="text-xs text-gray-500 mt-1">Picker updates to nearest color name; submitted as text.</p>
              </div>
              <div>
                <label htmlFor="pattern" className="block text-sm font-medium text-gray-700 mb-1">Pattern</label>
                <input id="pattern" name="pattern" type="text" value={formData.pattern} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]" required />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (g/m²)</label>
                <input id="weight" name="weight" type="number" step="1" min="1" value={formData.weight} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <div className="flex space-x-2">
                  <input id="width" name="width" type="number" step="0.01" min="0.01" value={formData.width} onChange={handleInputChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]" required />
                  <select name="widthUnit" value={formData.widthUnit} onChange={handleInputChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]">
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="composition" className="block text-sm font-medium text-gray-700 mb-1">Composition</label>
                <input id="composition" name="composition" type="text" value={formData.composition} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]" required />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input id="supplier" name="supplier" type="text" value={formData.supplier} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]" required />
              </div>
              <div>
                <label htmlFor="pricePerMeter" className="block text-sm font-medium text-gray-700 mb-1">Price per meter (₦)</label>
                <input id="pricePerMeter" name="pricePerMeter" type="number" step="0.01" min="0" value={formData.pricePerMeter} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]" required />
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <input id="inStock" name="inStock" type="checkbox" checked={formData.inStock} onChange={handleInputChange} className="h-4 w-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]" />
                <label htmlFor="inStock" className="text-sm font-medium text-gray-700">In stock</label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 text-sm text-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div><span className="text-gray-500">Name:</span> {formData.name || '-'}</div>
                <div><span className="text-gray-500">Type:</span> {formData.type || '-'}</div>
                <div><span className="text-gray-500">Color:</span> {formData.color || '-'}</div>
                <div><span className="text-gray-500">Pattern:</span> {formData.pattern || '-'}</div>
                <div><span className="text-gray-500">Weight:</span> {formData.weight || '-'} {formData.weight ? 'g/m²' : ''}</div>
                <div><span className="text-gray-500">Width:</span> {formData.width || '-'} {formData.width ? formData.widthUnit : ''}</div>
                <div className="md:col-span-2"><span className="text-gray-500">Composition:</span> {formData.composition || '-'}</div>
                <div><span className="text-gray-500">Supplier:</span> {formData.supplier || '-'}</div>
                <div><span className="text-gray-500">Price/m:</span> {formData.pricePerMeter || '-'} {formData.pricePerMeter ? '₦' : ''}</div>
                <div><span className="text-gray-500">In stock:</span> {formData.inStock ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div>
              {step > 1 && (
                <button type="button" onClick={prevStep} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Back</button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
              {step < 4 ? (
                <button type="button" onClick={nextStep} disabled={isLoading} className="px-6 py-2 bg-[#D4AF37] text-white text-sm font-medium rounded-lg hover:bg-[#D4AF37]/90 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
              ) : (
                <button type="submit" disabled={isLoading} className="px-6 py-2 bg-[#D4AF37] text-white text-sm font-medium rounded-lg hover:bg-[#D4AF37]/90 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                  {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{isLoading ? 'Updating...' : 'Update Fabric'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


