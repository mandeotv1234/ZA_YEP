import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import socketService from '../services/socket';
import { motion } from 'framer-motion';

export const Results: React.FC = () => {
  const { width, height } = useWindowSize();
  const [results, setResults] = useState<{ mr: any[], mrs: any[] } | null>(null);

  useEffect(() => {
    // Request results via WebSocket
    socketService.getResults();

    // Listen for results
    socketService.onResultsReady((data) => {
      setResults(data);
    });

    return () => {
      socketService.removeListener('resultsReady');
    };
  }, []);

  if (!results) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const WinnerCard = ({ title, data, color, icon }: any) => (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="card text-center relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-full h-2 ${color}`}></div>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className={`text-xl font-bold mb-2 ${color.replace('bg-', 'text-')}`}>{title}</h3>
      
      {data && data[0] ? (
        <div className="py-4">
          <p className="text-3xl font-bold text-gray-800 mb-1">{data[0].name}</p>
          <p className="text-sm text-gray-500">{data[0].count} phiếu</p>
        </div>
      ) : (
        <p className="text-gray-400 py-4">Chưa có kết quả</p>
      )}
      
      {data && data[1] && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">Á quân: <strong>{data[1].name}</strong> ({data[1].count})</p>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-600 p-4 py-10 overflow-y-auto">
      <Confetti width={width} height={height} numberOfPieces={200} recycle={true} />
      
      <div className="max-w-md mx-auto space-y-8 relative z-10">
        <div className="text-center text-white mb-10">
          <h1 className="text-4xl font-bold mb-2 text-yellow-300 drop-shadow-lg">WINNERS</h1>
          <p className="text-blue-100 text-lg">King & Queen of the Night</p>
        </div>

        <WinnerCard 
          title="Mr. Impressive" 
          data={results.mr} 
          color="bg-blue-500" 
          icon="👑" 
        />

        <WinnerCard 
          title="Mrs. Impressive" 
          data={results.mrs} 
          color="bg-pink-500" 
          icon="👸" 
        />
        
        <div className="text-center text-white/60 text-sm mt-10">
          Zalo Year End Party 2024
        </div>
      </div>
    </div>
  );
};
