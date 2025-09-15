'use client';

interface ReportCardProps {
  label: string;
  value: string;
  active: boolean;
  onClick?: () => void;
  className?: string;
}

export default function ReportCard({ 
  label, 
  value, 
  active, 
  onClick,
  className = ""
}: ReportCardProps) {
  return (
    <div 
      className={`text-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
        active 
          ? 'bg-[#D4AF37]/10 border-b-2 border-[#D4AF37]' 
          : 'bg-gray-50 hover:bg-gray-100'
      } ${className}`}
      onClick={onClick}
    >
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
