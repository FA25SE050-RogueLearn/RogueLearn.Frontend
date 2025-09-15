'use client';

import { useEffect, useRef, useState } from 'react';
import { Application, Graphics, Text } from 'pixi.js';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PixiGame: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    let cleanupEventListeners: (() => void) | null = null;

    const initPixi = async () => {
      if (!gameRef.current || appRef.current) return; // Prevent multiple initializations

      // Create a new application
      const app = new Application();

      // Initialize the application with black background
      await app.init({ 
        background: '#000000', 
        resizeTo: gameRef.current,
        width: 800,
        height: 600
      });

      // Store app reference for cleanup
      appRef.current = app;

      // Clear any existing content and append the application canvas
      gameRef.current.innerHTML = '';
      gameRef.current.appendChild(app.canvas);

      // Create a rectangle
      const rectangle = new Graphics();
      rectangle.rect(0, 0, 50, 50);
      rectangle.fill(0xff0000); // Red color

      // Position rectangle at center
      rectangle.x = app.screen.width / 2 - 25;
      rectangle.y = app.screen.height / 2 - 25;

      // Add rectangle to stage
      app.stage.addChild(rectangle);

      // Create interactive button
      const buttonGraphics = new Graphics();
      buttonGraphics.roundRect(0, 0, 120, 40, 8);
      buttonGraphics.fill(0x007acc); // Blue color
      
      // Button position
      buttonGraphics.x = app.screen.width - 150;
      buttonGraphics.y = 50;

      // Button text
      const buttonText = new Text({
        text: 'Interact',
        style: {
          fontFamily: 'Arial',
          fontSize: 16,
          fill: 0xffffff,
          fontWeight: 'bold'
        }
      });
      
      buttonText.x = buttonGraphics.x + 60 - buttonText.width / 2;
      buttonText.y = buttonGraphics.y + 20 - buttonText.height / 2;

      // Add button to stage
      app.stage.addChild(buttonGraphics);
      app.stage.addChild(buttonText);

      // Movement speed
      const speed = 5;

      // Key states
      const keys: { [key: string]: boolean } = {};

      // Button hover state
      let isHovering = false;
      const originalButtonScale = 1;
      const hoverButtonScale = 1.1;

      // Key event listeners
      const handleKeyDown = (e: KeyboardEvent) => {
        keys[e.key.toLowerCase()] = true;
        
        // Open dialog when E is pressed and hovering over button
        if (e.key.toLowerCase() === 'e' && isHovering) {
          setIsDialogOpen(true);
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        keys[e.key.toLowerCase()] = false;
      };

      // Collision detection function
      const checkCollision = (rect1: any, rect2: any) => {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + 50 > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + 50 > rect2.y;
      };

      // Add event listeners
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      // Animation loop
      app.ticker.add(() => {
        // WASD movement
        if (keys['w'] || keys['arrowup']) {
          rectangle.y = Math.max(0, rectangle.y - speed);
        }
        if (keys['s'] || keys['arrowdown']) {
          rectangle.y = Math.min(app.screen.height - 50, rectangle.y + speed);
        }
        if (keys['a'] || keys['arrowleft']) {
          rectangle.x = Math.max(0, rectangle.x - speed);
        }
        if (keys['d'] || keys['arrowright']) {
          rectangle.x = Math.min(app.screen.width - 50, rectangle.x + speed);
        }

        // Check collision with button
        const wasHovering = isHovering;
        isHovering = checkCollision(rectangle, buttonGraphics);

        // Update button scale based on hover state
        if (isHovering && !wasHovering) {
          // Start hovering
          buttonGraphics.scale.set(hoverButtonScale);
          buttonText.scale.set(hoverButtonScale);
          // Adjust position to keep button centered when scaled
          buttonGraphics.x = app.screen.width - 150 - (buttonGraphics.width * (hoverButtonScale - originalButtonScale)) / 2;
          buttonGraphics.y = 50 - (buttonGraphics.height * (hoverButtonScale - originalButtonScale)) / 2;
          buttonText.x = buttonGraphics.x + 60 - buttonText.width / 2;
          buttonText.y = buttonGraphics.y + 20 - buttonText.height / 2;
        } else if (!isHovering && wasHovering) {
          // Stop hovering
          buttonGraphics.scale.set(originalButtonScale);
          buttonText.scale.set(originalButtonScale);
          // Reset position
          buttonGraphics.x = app.screen.width - 150;
          buttonGraphics.y = 50;
          buttonText.x = buttonGraphics.x + 60 - buttonText.width / 2;
          buttonText.y = buttonGraphics.y + 20 - buttonText.height / 2;
        }
      });

      // Store cleanup function for event listeners
      cleanupEventListeners = () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    };

    initPixi();

    // Cleanup function
    return () => {
      cleanupEventListeners?.();
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div className="w-full h-full flex flex-col justify-center items-center">
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Use <strong>WASD</strong> or arrow keys to move the red rectangle
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Move over the blue button and press <strong>E</strong> to interact
          </p>
        </div>
        <div 
          ref={gameRef} 
          className="border border-gray-300 rounded-lg shadow-lg"
          style={{ width: '800px', height: '600px' }}
          tabIndex={0}
        />
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Interaction Dialog</DialogTitle>
            <DialogDescription>
              You successfully interacted with the button! This dialog can contain game menus, 
              inventory, character stats, or any other game interface elements.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              This is where you could add:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
              <li>Character inventory</li>
              <li>Shop interface</li>
              <li>Quest dialog</li>
              <li>Game settings</li>
              <li>Level progression</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PixiGame;
