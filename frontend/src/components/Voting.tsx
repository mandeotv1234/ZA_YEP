import React, { useState, useEffect } from 'react';
import socketService from '../services/socket';

interface VotingProps {
  domain: string;
  startTime: number;
  durationMs: number;
  onVoteSuccess: () => void;
  onTimeUp: () => void;
}

export const Voting: React.FC<VotingProps> = ({ domain, startTime, durationMs, onVoteSuccess, onTimeUp }) => {
  const [mrName, setMrName] = useState('');
  const [mrsName, setMrsName] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, durationMs - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);

    // Listen for vote errors
    socketService.onVoteError((err) => {
      setError(err.message);
      setSubmitting(false);
    });

    // Listen for vote success
    socketService.onVoteSuccess(() => {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        onVoteSuccess();
      }, 1000);
    });

    return () => {
      clearInterval(interval);
      socketService.removeListener('voteError');
      socketService.removeListener('voteSuccess');
    };
  }, [startTime, durationMs, onVoteSuccess, onTimeUp]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60));
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mrName || !mrsName) {
      setError('Vui lòng nhập tên đầy đủ');
      return;
    }

    setError('');
    setSubmitting(true);
    socketService.submitVote(domain, mrName, mrsName);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-zalo-blue text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold">Zalo YEP 2025</h1>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
          {domain}
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Timer Card */}
        <div className="bg-zalo-blue rounded-2xl p-6 text-center text-white shadow-lg shadow-blue-200">
          <p className="text-blue-100 text-xs font-bold tracking-widest uppercase mb-1">Thời gian bình chọn</p>
          <div className="text-5xl font-black font-mono tracking-tight">
            {formatTime(timeLeft)}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mr Input */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👨</span>
              <h3 className="font-black text-gray-900 uppercase tracking-tight">Mr. Impressive</h3>
            </div>
            <input
              type="text"
              value={mrName}
              onChange={(e) => setMrName(e.target.value)}
              placeholder="Nhập tên người Nam ấn tượng"
              className="w-full bg-gray-50 px-4 py-4 rounded-xl text-gray-800 placeholder-gray-400 font-medium outline-none focus:ring-2 focus:ring-zalo-blue/20 transition-all"
              required
            />
          </div>

          {/* Mrs Input */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👩</span>
              <h3 className="font-black text-pink-500 uppercase tracking-tight">Mrs. Impressive</h3>
            </div>
            <input
              type="text"
              value={mrsName}
              onChange={(e) => setMrsName(e.target.value)}
              placeholder="Nhập tên người Nữ ấn tượng"
              className="w-full bg-gray-50 px-4 py-4 rounded-xl text-gray-800 placeholder-gray-400 font-medium outline-none focus:ring-2 focus:ring-pink-500/20 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting || timeLeft <= 0 || submitted}
            className="w-full relative bg-zalo-blue text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg uppercase tracking-wide mt-4"
          >
            <div className="flex items-center justify-center gap-2">
              {submitting && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>
                {submitted ? '✓ Đã bình chọn' : submitting ? 'Đang gửi...' : 'Xác nhận bình chọn'}
              </span>
            </div>
          </button>
          
          <p className="text-center text-xs text-gray-400 font-medium">
            Lưu ý: Bạn chỉ được bình chọn một lần duy nhất.
          </p>
        </form>
      </div>
    </div>
  );
};
