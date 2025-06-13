import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const CarromBoard = ({ 
  gameState, 
  onShot, 
  onGameUpdate,
  isPlayerTurn = true 
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isAiming, setIsAiming] = useState(false);
  const [aimLine, setAimLine] = useState({ start: null, end: null });
  const [strikerPosition, setStrikerPosition] = useState({ x: 320, y: 500 });
  const [coins, setCoins] = useState([]);
  const [power, setPower] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Board dimensions and constants
  const BOARD_SIZE = 600;
  const BOARD_MARGIN = 50;
  const COIN_RADIUS = 12;
  const STRIKER_RADIUS = 15;
  const POCKET_RADIUS = 25;
  const FRICTION = 0.98;
  const BOUNCE_DAMPING = 0.7;

  // Pocket positions (corners of the board)
  const POCKETS = [
    { x: BOARD_MARGIN + 25, y: BOARD_MARGIN + 25 }, // Top-left
    { x: BOARD_SIZE - BOARD_MARGIN - 25, y: BOARD_MARGIN + 25 }, // Top-right
    { x: BOARD_MARGIN + 25, y: BOARD_SIZE - BOARD_MARGIN - 25 }, // Bottom-left
    { x: BOARD_SIZE - BOARD_MARGIN - 25, y: BOARD_SIZE - BOARD_MARGIN - 25 } // Bottom-right
  ];

  // Initialize coins from game state
  useEffect(() => {
    if (gameState?.boardState) {
      setCoins(gameState.boardState.filter(coin => coin.id !== 'striker'));
      const striker = gameState.boardState.find(coin => coin.id === 'striker');
      if (striker) {
        setStrikerPosition(striker.position);
      }
    }
  }, [gameState]);

  // Drawing functions
  const drawBoard = (ctx) => {
    // Clear canvas
    ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    
    // Draw background
    ctx.fillStyle = '#2C1810';
    ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    
    // Draw board surface
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(BOARD_MARGIN, BOARD_MARGIN, BOARD_SIZE - BOARD_MARGIN * 2, BOARD_SIZE - BOARD_MARGIN * 2);
    
    // Draw board frame
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 8;
    ctx.strokeRect(BOARD_MARGIN, BOARD_MARGIN, BOARD_SIZE - BOARD_MARGIN * 2, BOARD_SIZE - BOARD_MARGIN * 2);
    
    // Draw center circle
    ctx.strokeStyle = '#F5DEB3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(BOARD_SIZE / 2, BOARD_SIZE / 2, 60, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw arrows at center (traditional carrom markings)
    ctx.fillStyle = '#F5DEB3';
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(BOARD_SIZE / 2, BOARD_SIZE / 2);
      ctx.rotate((i * Math.PI) / 2);
      ctx.beginPath();
      ctx.moveTo(0, -45);
      ctx.lineTo(-8, -30);
      ctx.lineTo(8, -30);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    
    // Draw pockets
    POCKETS.forEach(pocket => {
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, POCKET_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      
      // Pocket highlight
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 3;
      ctx.stroke();
    });
    
    // Draw striker baseline
    ctx.strokeStyle = '#F5DEB3';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(BOARD_MARGIN + 50, BOARD_SIZE - BOARD_MARGIN - 30);
    ctx.lineTo(BOARD_SIZE - BOARD_MARGIN - 50, BOARD_SIZE - BOARD_MARGIN - 30);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawCoin = (ctx, coin) => {
    if (coin.isPocketed) return;
    
    const { x, y } = coin.position;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, COIN_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Coin body
    if (coin.type === 'white') {
      ctx.fillStyle = '#F5F5F5';
    } else if (coin.type === 'black') {
      ctx.fillStyle = '#2C2C2C';
    } else if (coin.type === 'queen') {
      ctx.fillStyle = '#DC143C';
    }
    
    ctx.beginPath();
    ctx.arc(x, y, COIN_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Coin border
    ctx.strokeStyle = coin.type === 'queen' ? '#FFD700' : '#8B4513';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Coin highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, COIN_RADIUS / 3, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawStriker = (ctx) => {
    const { x, y } = strikerPosition;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(x + 3, y + 3, STRIKER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Striker body
    ctx.fillStyle = isPlayerTurn ? '#8B4513' : '#A0A0A0';
    ctx.beginPath();
    ctx.arc(x, y, STRIKER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Striker border
    ctx.strokeStyle = isPlayerTurn ? '#FFD700' : '#666';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Striker highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x - 4, y - 4, STRIKER_RADIUS / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Pulse effect when it's player's turn
    if (isPlayerTurn && !isAnimating) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, STRIKER_RADIUS + 5 + Math.sin(Date.now() / 300) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawAimLine = (ctx) => {
    if (!isAiming || !aimLine.start || !aimLine.end) return;
    
    const distance = Math.sqrt(
      Math.pow(aimLine.end.x - aimLine.start.x, 2) + 
      Math.pow(aimLine.end.y - aimLine.start.y, 2)
    );
    
    const maxDistance = 150;
    const alpha = Math.max(0.3, 1 - distance / maxDistance);
    
    // Aim line
    ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(aimLine.start.x, aimLine.start.y);
    ctx.lineTo(aimLine.end.x, aimLine.end.y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Power indicator at end of line
    if (power > 0) {
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(aimLine.end.x, aimLine.end.y, 3 + power * 8, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Physics functions
  const checkCollision = (obj1, obj2, radius1 = COIN_RADIUS, radius2 = COIN_RADIUS) => {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (radius1 + radius2);
  };

  const resolveCollision = (obj1, obj2) => {
    const dx = obj2.position.x - obj1.position.x;
    const dy = obj2.position.y - obj1.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;
    
    // Normalize
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Relative velocity
    const dvx = obj2.velocity.x - obj1.velocity.x;
    const dvy = obj2.velocity.y - obj1.velocity.y;
    
    // Relative velocity in collision normal direction
    const dvn = dvx * nx + dvy * ny;
    
    // Do not resolve if velocities are separating
    if (dvn > 0) return;
    
    // Collision impulse
    const impulse = 2 * dvn / 2; // Assuming equal mass
    
    // Update velocities
    obj1.velocity.x += impulse * nx;
    obj1.velocity.y += impulse * ny;
    obj2.velocity.x -= impulse * nx;
    obj2.velocity.y -= impulse * ny;
    
    // Separate overlapping objects
    const overlap = (COIN_RADIUS * 2) - distance;
    if (overlap > 0) {
      const separationX = (overlap / 2) * nx;
      const separationY = (overlap / 2) * ny;
      
      obj1.position.x -= separationX;
      obj1.position.y -= separationY;
      obj2.position.x += separationX;
      obj2.position.y += separationY;
    }
  };

  const checkPocketCollision = (coin) => {
    return POCKETS.some(pocket => {
      const dx = coin.position.x - pocket.x;
      const dy = coin.position.y - pocket.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < POCKET_RADIUS;
    });
  };

  const updatePhysics = () => {
    const allObjects = [...coins, { 
      id: 'striker', 
      type: 'striker', 
      position: strikerPosition, 
      velocity: { x: 0, y: 0 }, 
      isPocketed: false 
    }];
    
    let hasMovement = false;
    let pocketedCoins = [];
    let strikerPocketed = false;
    
    // Update positions and apply friction
    allObjects.forEach(obj => {
      if (obj.isPocketed) return;
      
      obj.position.x += obj.velocity.x;
      obj.position.y += obj.velocity.y;
      
      obj.velocity.x *= FRICTION;
      obj.velocity.y *= FRICTION;
      
      // Stop very slow objects
      if (Math.abs(obj.velocity.x) < 0.1 && Math.abs(obj.velocity.y) < 0.1) {
        obj.velocity.x = 0;
        obj.velocity.y = 0;
      } else {
        hasMovement = true;
      }
      
      // Wall collisions
      const radius = obj.type === 'striker' ? STRIKER_RADIUS : COIN_RADIUS;
      if (obj.position.x - radius < BOARD_MARGIN) {
        obj.position.x = BOARD_MARGIN + radius;
        obj.velocity.x *= -BOUNCE_DAMPING;
      }
      if (obj.position.x + radius > BOARD_SIZE - BOARD_MARGIN) {
        obj.position.x = BOARD_SIZE - BOARD_MARGIN - radius;
        obj.velocity.x *= -BOUNCE_DAMPING;
      }
      if (obj.position.y - radius < BOARD_MARGIN) {
        obj.position.y = BOARD_MARGIN + radius;
        obj.velocity.y *= -BOUNCE_DAMPING;
      }
      if (obj.position.y + radius > BOARD_SIZE - BOARD_MARGIN) {
        obj.position.y = BOARD_SIZE - BOARD_MARGIN - radius;
        obj.velocity.y *= -BOUNCE_DAMPING;
      }
      
      // Check pocket collisions
      if (checkPocketCollision(obj)) {
        obj.isPocketed = true;
        if (obj.type === 'striker') {
          strikerPocketed = true;
        } else {
          pocketedCoins.push(obj);
        }
      }
    });
    
    // Check coin-to-coin collisions
    for (let i = 0; i < allObjects.length; i++) {
      for (let j = i + 1; j < allObjects.length; j++) {
        const obj1 = allObjects[i];
        const obj2 = allObjects[j];
        
        if (obj1.isPocketed || obj2.isPocketed) continue;
        
        const radius1 = obj1.type === 'striker' ? STRIKER_RADIUS : COIN_RADIUS;
        const radius2 = obj2.type === 'striker' ? STRIKER_RADIUS : COIN_RADIUS;
        
        if (checkCollision(obj1, obj2, radius1, radius2)) {
          resolveCollision(obj1, obj2);
        }
      }
    }
    
    // Update state
    const striker = allObjects.find(obj => obj.id === 'striker');
    if (striker && !striker.isPocketed) {
      setStrikerPosition(striker.position);
    }
    
    setCoins(allObjects.filter(obj => obj.id !== 'striker'));
    
    if (!hasMovement) {
      setIsAnimating(false);
      
      // Calculate score for pocketed coins
      let score = 0;
      pocketedCoins.forEach(coin => {
        if (coin.type === 'white') score += 20;
        else if (coin.type === 'black') score += 10;
        else if (coin.type === 'queen') score += 50;
      });
      
      // Handle shot result
      if (onShot) {
        onShot({
          coinsPocketed: pocketedCoins,
          strikerPocketed,
          score,
          foul: strikerPocketed || pocketedCoins.length === 0
        });
      }
      
      // Show notifications
      if (pocketedCoins.length > 0) {
        toast.success(`Pocketed ${pocketedCoins.length} coin(s)! +${score} points`);
      }
      if (strikerPocketed) {
        toast.error("Striker pocketed! Foul!");
      }
    }
  };

  // Animation loop
  const animate = useCallback(() => {
    if (!isAnimating) return;
    
    updatePhysics();
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      drawBoard(ctx);
      coins.forEach(coin => drawCoin(ctx, coin));
      drawStriker(ctx);
      drawAimLine(ctx);
    }
    
    animationRef.current = requestAnimationFrame(animate);
  }, [isAnimating, coins, strikerPosition, isAiming, aimLine, power]);

  useEffect(() => {
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animate]);

  // Canvas drawing when not animating
  useEffect(() => {
    if (!isAnimating) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        drawBoard(ctx);
        coins.forEach(coin => drawCoin(ctx, coin));
        drawStriker(ctx);
        drawAimLine(ctx);
      }
    }
  }, [coins, strikerPosition, isAiming, aimLine, power, isAnimating]);

  // Mouse event handlers
  const handleMouseDown = (e) => {
    if (!isPlayerTurn || isAnimating) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking near striker
    const dx = x - strikerPosition.x;
    const dy = y - strikerPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < STRIKER_RADIUS + 10) {
      setIsAiming(true);
      setAimLine({ start: { x: strikerPosition.x, y: strikerPosition.y }, end: { x, y } });
    }
  };

  const handleMouseMove = (e) => {
    if (!isAiming || !isPlayerTurn || isAnimating) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setAimLine(prev => ({ ...prev, end: { x, y } }));
    
    // Calculate power based on distance
    const distance = Math.sqrt(
      Math.pow(x - strikerPosition.x, 2) + 
      Math.pow(y - strikerPosition.y, 2)
    );
    const maxDistance = 150;
    const calculatedPower = Math.min(distance / maxDistance, 1);
    setPower(calculatedPower);
  };

  const handleMouseUp = () => {
    if (!isAiming || !isPlayerTurn || isAnimating) return;
    
    if (power > 0.1) { // Minimum power threshold
      // Calculate shot velocity
      const dx = aimLine.end.x - aimLine.start.x;
      const dy = aimLine.end.y - aimLine.start.y;
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      
      if (magnitude > 0) {
        const maxVelocity = 15;
        const velocity = {
          x: (dx / magnitude) * power * maxVelocity,
          y: (dy / magnitude) * power * maxVelocity
        };
        
        // Start animation with striker velocity
        const striker = {
          id: 'striker',
          type: 'striker',
          position: { ...strikerPosition },
          velocity,
          isPocketed: false
        };
        
        // Add striker to coins array temporarily for physics
        setCoins(prev => [...prev, striker]);
        setIsAnimating(true);
      }
    }
    
    setIsAiming(false);
    setAimLine({ start: null, end: null });
    setPower(0);
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <canvas
          ref={canvasRef}
          width={BOARD_SIZE}
          height={BOARD_SIZE}
          className={`border-4 border-primary rounded-lg shadow-2xl cursor-crosshair ${
            isAiming ? 'cursor-none' : 'cursor-crosshair'
          } ${!isPlayerTurn || isAnimating ? 'pointer-events-none opacity-75' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsAiming(false);
            setAimLine({ start: null, end: null });
            setPower(0);
          }}
        />
        
        {/* Turn indicator overlay */}
        <AnimatePresence>
          {!isPlayerTurn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center"
            >
              <div className="bg-surface-100/90 wood-texture rounded-lg border-2 border-primary/20 p-4 shadow-lg">
                <Text variant="heading" size="lg" weight="bold" color="primary">
                  Opponent's Turn
                </Text>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Animation overlay */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 left-4 bg-surface-100/90 wood-texture rounded-lg border-2 border-primary/20 p-2 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-3 h-3 bg-accent rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
                <Text variant="body" size="sm" weight="medium" color="primary">
                  Shot in progress...
                </Text>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CarromBoard;