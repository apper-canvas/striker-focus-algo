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
  // Enhanced validation and sanitization
  const safeVariant = variant && typeof variant === 'string' && variant.trim() ? variant.trim() : 'body';
  const safeSize = size && typeof size === 'string' && size.trim() ? size.trim() : 'base';
  const safeWeight = weight && typeof weight === 'string' && weight.trim() ? weight.trim() : 'normal';
  const safeColor = color && typeof color === 'string' && color.trim() ? color.trim() : 'default';
  const safeClassName = className && typeof className === 'string' ? className.trim() : '';
  
  // Handle children safely with additional checks
  const safeChildren = children !== null && children !== undefined ? children : '';
  
  // Validate children is renderable
  if (typeof safeChildren === 'object' && safeChildren !== null && !React.isValidElement(safeChildren)) {
    console.warn('Text component received non-renderable object as children:', safeChildren);
    return <span className="text-surface-50">Invalid content</span>;
  }
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
// Additional safety check for class composition
  const finalClassName = [variantClass, sizeClass, weightClass, colorClass, safeClassName]
    .filter(cls => cls && typeof cls === 'string')
    .join(' ')
    .trim();

  try {
    return (
      <span 
        className={finalClassName || 'text-surface-50'}
        {...props}
      >
        {safeChildren}
      </span>
    );
  } catch (error) {
    console.error('Text component render error:', error, {
      variant: safeVariant,
      size: safeSize,
      weight: safeWeight,
      color: safeColor,
      children: safeChildren
    });
    // Fallback with minimal styling
    return <span className="text-surface-50">{String(safeChildren || '')}</span>;
  }
};

export default Text;