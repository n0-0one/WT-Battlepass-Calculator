import React from 'react';

interface StatCardProps {
  title: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  subtitle?: string;
  className?: string;
  headerRight?: React.ReactNode;
  valueSize?: 'sm' | 'md' | 'lg' | 'xl';
  valueColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  children,
  subtitle,
  className = '',
  headerRight,
  valueSize = 'lg',
  valueColor = 'text-white',
}) => {
  const sizeClasses = {
    sm: 'text-lg font-bold',
    md: 'text-2xl font-bold',
    lg: 'text-3xl sm:text-4xl font-extrabold',
    xl: 'text-4xl sm:text-5xl font-black',
  };

  return (
    <div className={`bs-card ${className}`}>
      <div className="bs-card-header flex items-center justify-between">
        <span className="truncate">{title}</span>
        {headerRight && <div className="text-xs">{headerRight}</div>}
      </div>
      <div className="bs-card-body flex flex-col items-center justify-center text-center min-h-[5.5rem]">
        {value !== undefined && (
          <div className={`${sizeClasses[valueSize]} ${valueColor} font-mono tracking-tight`}>
            {value}
          </div>
        )}
        {subtitle && <p className="text-xs text-dark-muted mt-1">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};
