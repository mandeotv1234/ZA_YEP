import React from 'react';
import { startGame } from '../services/api';

interface LobbyProps {
  onStart: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-zalo-blue text-white p-4 flex justify-center items-center shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold">Zalo YEP 2024</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 mt-10 flex flex-col items-center">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center w-full">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto relative z-10">
              <span className="text-5xl">⏳</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-3">Đang chờ bắt đầu...</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Chương trình bình chọn <br/>
            <span className="font-bold text-zalo-blue">King & Queen</span> <br/>
            sẽ sớm diễn ra.
          </p>

          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 text-zalo-blue font-medium animate-pulse">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Vui lòng giữ màn hình này</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
