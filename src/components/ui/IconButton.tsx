import React from 'react';
import clsx from 'clsx';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  color?: 'default' | 'green' | 'orange' | 'cyan' | 'red';
  size?: 'sm' | 'md';
}

const colorMap: Record<string, { base: string; active: string }> = {
  default: { base: 'bg-gray-100 text-gray-500 hover:bg-gray-200', active: 'bg-gray-200 text-gray-700 shadow-sm' },
  green: { base: 'bg-gray-100 text-gray-500 hover:bg-gray-200', active: 'bg-green-100 text-green-700 hover:bg-green-200 shadow-sm' },
  orange: { base: 'bg-gray-100 text-gray-500 hover:bg-gray-200', active: 'bg-orange-100 text-orange-600 hover:bg-orange-200 shadow-sm' },
  cyan: { base: 'bg-gray-100 text-gray-500 hover:bg-gray-200', active: 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200 shadow-sm' },
  red: { base: 'bg-red-100 text-red-600', active: 'bg-red-100 text-red-600' },
};

export const IconButton: React.FC<IconButtonProps> = ({ active, color='default', size='md', className, ...rest }) => {
  const cfg = colorMap[color];
  return (
    <button
      className={clsx('flex items-center justify-center rounded-xl font-medium transition-all duration-200',
        size === 'md' ? 'w-12 h-12' : 'w-8 h-8',
        active ? cfg.active : cfg.base,
        className)}
      {...rest}
    />
  );
};
