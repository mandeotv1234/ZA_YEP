
import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Lobby } from './components/Lobby';
import { Voting } from './components/Voting';
import { Results } from './components/Results';
import { checkGameState } from './services/api';
import './index.css'


function App() {
  const [domain, setDomain] = useState<string | null>(localStorage.getItem('zalo_domain'));
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = (d: string) => {
    localStorage.setItem('zalo_domain', d);
    setDomain(d);
  };

  const fetchState = async () => {
    if (!domain) return;
    try {
      const state = await checkGameState(domain);
      setGameState(state);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (domain) {
      fetchState();
      const interval = setInterval(fetchState, 2000); // Poll every 2s
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [domain]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white text-zalo-blue">Loading...</div>;

  if (!domain) {
    return <Login onLogin={handleLogin} />;
  }

  if (!gameState) return null;

  if (gameState.status === 'FINISHED') {
    return <Results />;
  }

  if (gameState.status === 'IDLE') {
    return <Lobby onStart={fetchState} />;
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
        onVoteSuccess={fetchState}
        onTimeUp={fetchState}
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
