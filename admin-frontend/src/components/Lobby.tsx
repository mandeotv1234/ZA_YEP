import React from 'react';
import { startGame } from '../services/api';

interface LobbyProps {
  onStart: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onStart }) => {
  const handleStart = async () => {
    try {
      await startGame();
      onStart();
    } catch (error) {
      console.error('Failed to start game', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="card w-full max-w-md text-center space-y-8">
        <div className="animate-bounce text-6xl">🎉</div>
        <h1 className="text-2xl font-bold text-gray-800">
          Chào mừng đến với<br/>
          <span className="text-zalo-blue text-3xl">Zalo YEP 2024</span>
        </h1>
        
        <p className="text-gray-600">
          Hãy sẵn sàng bình chọn cho<br/>
          <strong>Mr & Mrs Ấn Tượng Nhất</strong>
        </p>

        <button onClick={handleStart} className="btn-primary w-full text-lg py-4 shadow-blue-500/30">
          Bắt đầu Bình chọn 🚀
        </button>
        
        <p className="text-xs text-gray-400 mt-4">
          Nhấn bắt đầu để kích hoạt thời gian cho tất cả mọi người
        </p>
      </div>
    </div>
  );
};
