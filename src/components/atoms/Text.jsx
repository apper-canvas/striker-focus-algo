import React from 'react';

const Text = ({ 
  children, 
  variant = 'body', 
  size = 'base', 
  weight = 'normal',
  color = 'default',
  className = '',
  ...props 
}) => {
  const variants = {
    display: 'font-heading',
    heading: 'font-heading',
    body: 'font-sans',
    caption: 'font-sans'
  };

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm', 
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };

  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const colors = {
    default: 'text-surface-50',
    muted: 'text-surface-300',
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error'
  };

  return (
    <span 
      className={`${variants[variant]} ${sizes[size]} ${weights[weight]} ${colors[color]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Text;