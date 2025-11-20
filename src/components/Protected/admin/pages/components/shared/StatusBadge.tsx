'use client';

interface StatusBadgeProps {
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Processing';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StatusBadge({ 
  status, 
  size = 'sm',
  className = ""
}: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-[#D4AF37]/20 text-[#D4AF37]';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'md':
        return 'text-sm px-3 py-1.5';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-xs px-2 py-1';
    }
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${getStatusStyles(status)} ${getSizeStyles(size)} ${className}`}
    >
      {status}
    </span>
  );
}
