import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 wood-texture border-2 border-primary/20";
  
  const variants = {
    primary: "bg-primary text-surface-50 hover:bg-primary/90 shadow-lg hover:shadow-xl",
    secondary: "bg-secondary text-surface-50 hover:bg-secondary/90 shadow-md hover:shadow-lg",
    outline: "bg-transparent text-primary border-primary hover:bg-primary hover:text-surface-50"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;