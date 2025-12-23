
import React, { useState, useEffect } from 'react';
import socketService from './services/socket';
import './index.css'

function App() {
  const [gameState, setGameState] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [voteCount, setVoteCount] = useState(0);

  useEffect(() => {
    // Connect to WebSocket as admin
    socketService.connect();
    socketService.adminConnected();

    // Listen for game state changes
    socketService.onGameStateChanged((state) => {
      setGameState(prev => ({
        ...prev,
        ...state
      }));
      setVoteCount(state.voteCount);
    });

    // Listen for admin game state
    socketService.onAdminGameState((data) => {
      setGameState(data);
      setVoteCount(data.voteCount);
    });

    // Listen for game reset
    socketService.onGameReset(() => {
      setResults(null);
      setVoteCount(0);
    });

    // Listen for results
    socketService.onResultsReady((data) => {
      setResults(data);
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const handleStart = () => {
    if (!confirm('Bạn có chắc chắn muốn bắt đầu game?')) return;
    setLoading(true);
    socketService.startGame();
    // Reset loading after a short delay
    setTimeout(() => setLoading(false), 1000);
  };

  const handleReset = () => {
    if (!confirm('CẢNH BÁO: Hành động này sẽ xóa toàn bộ dữ liệu bình chọn. Bạn có chắc chắn?')) return;
    setLoading(true);
    socketService.resetGame();
    setTimeout(() => setLoading(false), 1000);
  };

  const handleShowResults = () => {
    socketService.getResults();
  };

  if (!gameState) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-zalo-blue text-white p-4 shadow-md mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-100 text-sm">Zalo Year End Party 2024</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${
            gameState.status === 'IDLE' ? 'bg-yellow-400 text-yellow-900' :
            gameState.status === 'VOTING' ? 'bg-green-400 text-green-900 animate-pulse' :
            'bg-white text-zalo-blue'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {gameState.status}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🎮 Game Controls
            </h2>
            
            <div className="space-y-6">
              {gameState.status === 'IDLE' && (
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
                  <p className="text-gray-600 mb-4">Trò chơi chưa bắt đầu. Nhấn nút bên dưới để mở cổng bình chọn.</p>
                  <button 
                    onClick={handleStart}
                    disabled={loading}
                    className="w-full py-4 bg-zalo-blue hover:bg-blue-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
                  >
                    BẮT ĐẦU GAME 🚀
                  </button>
                </div>
              )}

              {gameState.status === 'VOTING' && (
                <div className="text-center p-8 bg-green-50 rounded-2xl border border-green-100">
                  <p className="text-green-800 font-medium mb-2 uppercase tracking-wide">Thời gian còn lại</p>
                  <Countdown target={gameState.startTime + gameState.durationMs} />
                  <p className="text-sm text-green-600 mt-4 animate-pulse">Đang nhận phiếu bầu... ({voteCount} phiếu)</p>
                </div>
              )}

              {gameState.status === 'FINISHED' && (
                <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-gray-700 font-medium mb-4">Bình chọn đã kết thúc ({voteCount} phiếu)</p>
                  <button 
                    onClick={handleShowResults}
                    className="w-full py-3 bg-zalo-blue text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
                  >
                    Xem Kết Quả
                  </button>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100">
                <button 
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full py-3 bg-white border-2 border-red-100 hover:bg-red-50 text-red-500 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>🗑️</span> Reset Game (Xóa dữ liệu)
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📊 Thống kê
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-500 text-sm mb-1">Số phiếu bầu</p>
                <p className="font-mono font-bold text-2xl text-zalo-blue">
                  {voteCount}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-500 text-sm mb-1">Thời gian bắt đầu</p>
                <p className="font-mono font-medium text-gray-800">
                  {gameState.startTime ? new Date(gameState.startTime).toLocaleTimeString() : '--:--:--'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-500 text-sm mb-1">Thời lượng</p>
                <p className="font-mono font-medium text-gray-800">
                  {gameState.durationMs / 60000} phút
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-blue-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-zalo-blue mb-2">🏆 KẾT QUẢ CHÍNH THỨC</h2>
              <p className="text-gray-500">Tổng số phiếu: {results.totalVotes}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* King Results */}
              <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl p-1 border border-blue-100">
                <div className="bg-white rounded-xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <span className="text-4xl">🤴</span>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Mr. Impressive</h3>
                      <p className="text-sm text-gray-500">Nam vương của đêm</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {results.mr.map((item: any, idx: number) => (
                      <div key={idx} className={`flex justify-between items-center p-4 rounded-xl transition-all ${
                        idx === 0 
                          ? 'bg-yellow-50 border border-yellow-200 shadow-sm scale-105 z-10' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                            idx === 0 ? 'bg-yellow-400 text-yellow-900' : 
                            idx === 1 ? 'bg-gray-300 text-gray-800' :
                            idx === 2 ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={`font-medium ${idx === 0 ? 'text-lg text-gray-900' : 'text-gray-700'}`}>
                            {item.name}
                          </span>
                        </div>
                        <span className={`font-mono font-bold ${idx === 0 ? 'text-yellow-600 text-xl' : 'text-gray-500'}`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                    {results.mr.length === 0 && (
                      <p className="text-center text-gray-400 py-4">Chưa có dữ liệu</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Queen Results */}
              <div className="bg-gradient-to-b from-pink-50 to-white rounded-2xl p-1 border border-pink-100">
                <div className="bg-white rounded-xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <span className="text-4xl">👸</span>
                    <div>
                      <h3 className="text-xl font-black text-pink-600">Mrs. Impressive</h3>
                      <p className="text-sm text-gray-500">Nữ hoàng của đêm</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {results.mrs.map((item: any, idx: number) => (
                      <div key={idx} className={`flex justify-between items-center p-4 rounded-xl transition-all ${
                        idx === 0 
                          ? 'bg-pink-50 border border-pink-200 shadow-sm scale-105 z-10' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                            idx === 0 ? 'bg-yellow-400 text-yellow-900' : 
                            idx === 1 ? 'bg-gray-300 text-gray-800' :
                            idx === 2 ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={`font-medium ${idx === 0 ? 'text-lg text-gray-900' : 'text-gray-700'}`}>
                            {item.name}
                          </span>
                        </div>
                        <span className={`font-mono font-bold ${idx === 0 ? 'text-pink-600 text-xl' : 'text-gray-500'}`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                    {results.mrs.length === 0 && (
                      <p className="text-center text-gray-400 py-4">Chưa có dữ liệu</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
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
  return <div className="text-4xl font-mono font-bold text-blue-600">{mins}:{secs.toString().padStart(2, '0')}</div>;
};

export default App;
