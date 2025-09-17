import PixiGame from '@/components/PixiGame';

export default function GamePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          RogueLearn Game
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          A Pixi.js powered learning game
        </p>
      </div>
      
      <div className="w-full max-w-4xl">
        <PixiGame />
      </div>
    </main>
  );
}