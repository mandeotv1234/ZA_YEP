import React, { useState, useEffect } from 'react';
import { submitVote } from '../services/api';

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

    return () => clearInterval(interval);
  }, [startTime, durationMs, onTimeUp]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60));
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mrName || !mrsName) return;

    setSubmitting(true);
    try {
      await submitVote(domain, mrName, mrsName);
      onVoteSuccess();
    } catch (error) {
      alert('Có lỗi xảy ra hoặc bạn đã bình chọn rồi!');
    } finally {
      setSubmitting(false);
    }
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
          <h1 className="text-lg font-bold">Zalo YEP 2024</h1>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mr Input */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">�</span>
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
              <span className="text-2xl">�</span>
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
            disabled={submitting || timeLeft <= 0}
            className="w-full bg-zalo-blue text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg uppercase tracking-wide mt-4"
          >
            {submitting ? 'Đang gửi...' : 'Xác nhận bình chọn'}
          </button>
          
          <p className="text-center text-xs text-gray-400 font-medium">
            Lưu ý: Bạn chỉ được bình chọn một lần duy nhất.
          </p>
        </form>
      </div>
    </div>
  );
};

