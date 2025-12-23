
import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Lobby } from './components/Lobby';
import { Voting } from './components/Voting';
import { Results } from './components/Results';
import socketService from './services/socket';
import './index.css'


function App() {
  const [domain, setDomain] = useState<string | null>(localStorage.getItem('zalo_domain'));
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = (d: string) => {
    localStorage.setItem('zalo_domain', d);
    setDomain(d);
  };

  useEffect(() => {
    if (!domain) {
      setLoading(false);
      return;
    }

    // Connect to WebSocket and login
    socketService.connect();
    socketService.userLogin(domain);

    // Listen for game state changes
    socketService.onGameStateChanged((state) => {
      setGameState(prev => ({
        ...prev,
        ...state
      }));
    });

    // Listen for user login confirmation
    socketService.onUserLoginSuccess((data) => {
      setGameState(data.gameState);
      setLoading(false);
    });

    return () => {
      socketService.removeListener('gameStateChanged');
      socketService.removeListener('userLoginSuccess');
    };
  }, [domain]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin h-12 w-12 text-zalo-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-zalo-blue font-medium">Đang kết nối...</p>
      </div>
    </div>
  );

  if (!domain) {
    return <Login onLogin={handleLogin} />;
  }

  if (!gameState) return null;

  if (gameState.status === 'FINISHED') {
    return <Results />;
  }

  if (gameState.status === 'IDLE') {
    return <Lobby onStart={() => {}} />;
  }

  if (gameState.status === 'VOTING') {
    if (gameState.hasVoted) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-4 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã ghi nhận bình chọn!</h2>
          <p className="text-gray-600">Hãy chờ kết quả sau khi thời gian kết thúc nhé.</p>
          <div className="mt-8 p-4 bg-white rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Thời gian còn lại</p>
            <Countdown target={gameState.startTime + gameState.durationMs} />
          </div>
        </div>
      );
    }
    return (
      <Voting 
        domain={domain} 
        startTime={gameState.startTime} 
        durationMs={gameState.durationMs}
        onVoteSuccess={() => {}}
        onTimeUp={() => {}}
      />
    );
  }

  return <div>Unknown State</div>;
}

const Countdown = ({ target }: { target: number }) => {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const i = setInterval(() => {
      setLeft(Math.max(0, target - Date.now()));
    }, 1000);
    return () => clearInterval(i);
  }, [target]);
  
  const mins = Math.floor(left / 60000);
  const secs = Math.floor((left % 60000) / 1000);
  return <div className="text-3xl font-mono font-bold text-zalo-blue mt-2">{mins}:{secs.toString().padStart(2, '0')}</div>;
};

export default App;
