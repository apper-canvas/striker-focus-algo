import React from 'react';
import { motion } from 'framer-motion';
import Text from '@/components/atoms/Text';

const ScorePanel = ({ 
  player1Score = 0, 
  player2Score = 0, 
  currentPlayer = 'player1',
  turnNumber = 1
}) => {
  // Enhanced safety validation
  const safePlayer1Score = typeof player1Score === 'number' && !isNaN(player1Score) && player1Score >= 0 ? player1Score : 0;
  const safePlayer2Score = typeof player2Score === 'number' && !isNaN(player2Score) && player2Score >= 0 ? player2Score : 0;
  const safeCurrentPlayer = currentPlayer && typeof currentPlayer === 'string' && (currentPlayer === 'player1' || currentPlayer === 'player2') ? currentPlayer : 'player1';
  const safeTurnNumber = typeof turnNumber === 'number' && !isNaN(turnNumber) && turnNumber > 0 ? Math.floor(turnNumber) : 1;

  // Validate Text component props
  const getValidTextColor = (color) => {
    const validColors = ['default', 'muted', 'primary', 'secondary', 'accent', 'success', 'warning', 'error'];
    return validColors.includes(color) ? color : 'primary';
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-100/90 wood-texture rounded-lg border-2 border-primary/20 p-4 shadow-lg backdrop-blur-sm"
    >
<div className="flex items-center justify-between mb-2">
        <Text variant="heading" size="lg" weight="bold" color="primary">
          Striker Pro
        </Text>
        <Text variant="body" size="sm" color="muted">
          Turn {safeTurnNumber}
        </Text>
      </div>
      <div className="grid grid-cols-2 gap-4">
<motion.div 
          className={`text-center p-3 rounded-lg border-2 transition-all duration-200 ${
            safeCurrentPlayer === 'player1' 
              ? 'border-accent bg-accent/10 shadow-md' 
              : 'border-surface-300/50 bg-surface-50/50'
          }`}
          animate={safeCurrentPlayer === 'player1' ? { scale: 1.05 } : { scale: 1 }}
        >
          <Text variant="body" size="sm" weight="medium" color="primary">
            Player 1
          </Text>
<Text 
            variant="display" 
            size="2xl" 
            weight="bold" 
            color={getValidTextColor(safeCurrentPlayer === 'player1' ? 'accent' : 'primary')}
          >
            {safePlayer1Score}
          </Text>
          {safeCurrentPlayer === 'player1' && (
            <motion.div
              className="w-2 h-2 bg-accent rounded-full mx-auto mt-1"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </motion.div>

<motion.div 
          className={`text-center p-3 rounded-lg border-2 transition-all duration-200 ${
            safeCurrentPlayer === 'player2' 
              ? 'border-accent bg-accent/10 shadow-md' 
              : 'border-surface-300/50 bg-surface-50/50'
          }`}
          animate={safeCurrentPlayer === 'player2' ? { scale: 1.05 } : { scale: 1 }}
        >
          <Text variant="body" size="sm" weight="medium" color="primary">
            Player 2
          </Text>
<Text 
            variant="display" 
            size="2xl" 
            weight="bold" 
            color={getValidTextColor(safeCurrentPlayer === 'player2' ? 'accent' : 'primary')}
          >
            {safePlayer2Score}
          </Text>
          {safeCurrentPlayer === 'player2' && (
            <motion.div
              className="w-2 h-2 bg-accent rounded-full mx-auto mt-1"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ScorePanel;