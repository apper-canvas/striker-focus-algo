import React from 'react';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { motion } from 'framer-motion';

const GameControls = ({ 
  onReset, 
  onSettings, 
  isGameActive = true,
  disabled = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-4"
    >
      <Button
        variant="outline"
        size="md"
        onClick={onReset}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        <ApperIcon name="RotateCcw" size={16} />
        New Game
      </Button>
      
      <Button
        variant="secondary"
        size="md"
        onClick={onSettings}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        <ApperIcon name="Settings" size={16} />
        Settings
      </Button>
    </motion.div>
  );
};

export default GameControls;