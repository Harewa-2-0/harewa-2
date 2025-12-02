import React, { useState } from 'react';
import { Send } from 'lucide-react';
import type { FashionChatInput } from '@/services/fashionChat';

interface FashionConsultationFormProps {
    onSubmit: (data: FashionChatInput) => void;
    disabled?: boolean;
}

const bodyTypes = ['hourglass', 'pear', 'apple', 'rectangle', 'inverted triangle'];
const occasions = ['casual', 'formal', 'business', 'party', 'wedding', 'sports'];
const preferenceOptions = ['minimalist', 'modern', 'classic', 'bohemian', 'edgy', 'romantic'];
const seasons = ['spring', 'summer', 'fall', 'winter'];

const FashionConsultationForm: React.FC<FashionConsultationFormProps> = ({ onSubmit, disabled = false }) => {
    const [bodyType, setBodyType] = useState('');
    const [occasion, setOccasion] = useState('');
    const [preferences, setPreferences] = useState<string[]>([]);
    const [colorPreferences, setColorPreferences] = useState<string[]>([]);
    const [season, setSeason] = useState('');
    const [requirements, setRequirements] = useState('');
    const [customColor, setCustomColor] = useState('');

    const handlePreferenceToggle = (pref: string) => {
        setPreferences(prev =>
            prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
        );
    };

    const handleAddColor = () => {
        if (customColor.trim() && !colorPreferences.includes(customColor.trim())) {
            setColorPreferences([...colorPreferences, customColor.trim()]);
            setCustomColor('');
        }
    };

    const handleRemoveColor = (color: string) => {
        setColorPreferences(colorPreferences.filter(c => c !== color));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!bodyType || !occasion || !season || preferences.length === 0 || colorPreferences.length === 0) {
            return;
        }

        onSubmit({
            bodyType,
            occasion,
            preferences,
            colorPreferences,
            season,
            requirements: requirements.trim(),
        });

        // Reset form
        setBodyType('');
        setOccasion('');
        setPreferences([]);
        setColorPreferences([]);
        setSeason('');
        setRequirements('');
    };

    const isValid = bodyType && occasion && season && preferences.length > 0 && colorPreferences.length > 0;

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white border-t border-gray-200">
            {/* Body Type */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Body Type *</label>
                <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:bg-gray-100"
                >
                    <option value="">Select body type</option>
                    {bodyTypes.map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                </select>
            </div>

            {/* Occasion */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Occasion *</label>
                <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:bg-gray-100"
                >
                    <option value="">Select occasion</option>
                    {occasions.map(occ => (
                        <option key={occ} value={occ}>{occ.charAt(0).toUpperCase() + occ.slice(1)}</option>
                    ))}
                </select>
            </div>

            {/* Season */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Season *</label>
                <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:bg-gray-100"
                >
                    <option value="">Select season</option>
                    {seasons.map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                </select>
            </div>

            {/* Style Preferences */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Style Preferences * (select multiple)</label>
                <div className="flex flex-wrap gap-2">
                    {preferenceOptions.map(pref => (
                        <button
                            key={pref}
                            type="button"
                            onClick={() => handlePreferenceToggle(pref)}
                            disabled={disabled}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${preferences.includes(pref)
                                ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#D4AF37]'
                                } disabled:opacity-50`}
                        >
                            {pref.charAt(0).toUpperCase() + pref.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Preferences */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Color Preferences *</label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                        placeholder="Add color (e.g., navy blue)"
                        disabled={disabled}
                        className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:bg-gray-100"
                    />
                    <button
                        type="button"
                        onClick={handleAddColor}
                        disabled={disabled || !customColor.trim()}
                        className="px-4 py-2 bg-[#D4AF37] text-white text-sm rounded-lg hover:bg-[#B8941F] disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Add
                    </button>
                </div>
                {colorPreferences.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {colorPreferences.map(color => (
                            <span
                                key={color}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                                {color}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveColor(color)}
                                    disabled={disabled}
                                    className="ml-1 text-gray-500 hover:text-gray-700"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Requirements */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Additional Requirements</label>
                <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Any specific requirements or details..."
                    disabled={disabled}
                    rows={2}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:bg-gray-100 resize-none"
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={!isValid || disabled}
                className={`w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${!isValid || disabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#D4AF37] text-white hover:bg-[#B8941F]'
                    }`}
            >
                <Send className="w-4 h-4" />
                Get Fashion Advice
            </button>
        </form>
    );
};

export default FashionConsultationForm;
