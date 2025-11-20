interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export default function Spinner({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'border-[#D4AF37]',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`} />
  );
}

// Table loading spinner component
export function TableSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

// Button spinner component
export function ButtonSpinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

// Page-level loading spinner (consistent with Dashboard)
export function PageSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
    </div>
  );
}
