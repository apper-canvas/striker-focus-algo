import React from 'react';
import { motion } from 'framer-motion';
import Text from '@/components/atoms/Text';

const PowerMeter = ({ power = 0, isVisible = false }) => {
  if (!isVisible) return null;

  // Enhanced power validation
  const safePower = typeof power === 'number' && !isNaN(power) ? power : 0;
  const powerPercentage = Math.min(Math.max(safePower * 100, 0), 100);
  const powerColor = powerPercentage < 30 ? 'success' : powerPercentage < 70 ? 'warning' : 'error';

  // Validate Text component color prop
  const getValidTextColor = (color) => {
    const validColors = ['default', 'muted', 'primary', 'secondary', 'accent', 'success', 'warning', 'error'];
    return validColors.includes(color) ? color : 'primary';
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="bg-surface-100/90 wood-texture rounded-lg border-2 border-primary/20 p-3 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <Text variant="body" size="sm" weight="medium" color="primary">
          Power
        </Text>
        
        <div className="flex-1 bg-surface-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-all duration-150 ${
              powerColor === 'success' ? 'bg-success' :
              powerColor === 'warning' ? 'bg-warning' : 'bg-error'
            }`}
            style={{ width: `${powerPercentage}%` }}
            animate={{ 
              boxShadow: `0 0 ${Math.floor(powerPercentage / 10)}px ${
                powerColor === 'success' ? 'rgba(34, 139, 34, 0.5)' :
                powerColor === 'warning' ? 'rgba(255, 140, 0, 0.5)' : 'rgba(220, 20, 60, 0.5)'
              }`
            }}
          />
        </div>
        
<Text 
          variant="body" 
          size="sm" 
          weight="bold" 
          color={getValidTextColor(powerColor)}
        >
          {Math.round(powerPercentage)}%
        </Text>
      </div>
    </motion.div>
  );
};

export default PowerMeter;