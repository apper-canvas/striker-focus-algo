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
  // Validate and sanitize props
  const safeVariant = variant && typeof variant === 'string' ? variant : 'body';
  const safeSize = size && typeof size === 'string' ? size : 'base';
  const safeWeight = weight && typeof weight === 'string' ? weight : 'normal';
  const safeColor = color && typeof color === 'string' ? color : 'default';
  const safeClassName = className && typeof className === 'string' ? className : '';
  
  // Handle children safely
  const safeChildren = children != null ? children : '';
  
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

  // Get safe values with fallbacks
  const variantClass = variants[safeVariant] || variants.body;
  const sizeClass = sizes[safeSize] || sizes.base;
  const weightClass = weights[safeWeight] || weights.normal;
  const colorClass = colors[safeColor] || colors.default;

  try {
    return (
      <span 
        className={`${variantClass} ${sizeClass} ${weightClass} ${colorClass} ${safeClassName}`}
        {...props}
      >
        {safeChildren}
      </span>
    );
  } catch (error) {
    console.error('Text component error:', error);
    return <span className="text-surface-50">{safeChildren}</span>;
  }
};

export default Text;