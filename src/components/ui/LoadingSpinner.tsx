import React from 'react';

interface Props { label?: string; className?: string; small?: boolean }

const LoadingSpinner: React.FC<Props> = ({ label='Cargando...', className='', small }) => {
  const size = small ? 'h-4 w-4 border-2' : 'h-8 w-8 border-3';
  return (
    <div className={`flex items-center gap-2 text-gray-600 ${className}`}> 
      <span className={`inline-block ${size} animate-spin rounded-full border-blue-500 border-t-transparent`} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export default LoadingSpinner;