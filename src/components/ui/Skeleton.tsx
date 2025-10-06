import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
  lineClassName?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className='', lines=1, lineClassName='' }) => {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}> 
      {Array.from({length: lines}).map((_,i)=>(
        <div key={i} className={`bg-gray-200 rounded h-3 ${lineClassName}`}></div>
      ))}
    </div>
  );
};

export default Skeleton;
