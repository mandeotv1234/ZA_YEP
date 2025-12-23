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
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 p-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <span className="font-medium text-gray-600">⏳ Thời gian còn lại</span>
          <span className={`text-2xl font-bold font-mono ${timeLeft < 60000 ? 'text-red-500 animate-pulse' : 'text-zalo-blue'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="mt-20 max-w-md mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Phiếu Bình Chọn</h2>
          <p className="text-gray-500">Hãy chọn ra người mặc đẹp nhất!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card space-y-4">
            <h3 className="text-lg font-semibold text-zalo-blue flex items-center gap-2">
              🤵 Mr. Impressive
            </h3>
            <input
              type="text"
              value={mrName}
              onChange={(e) => setMrName(e.target.value)}
              placeholder="Nhập tên nam..."
              className="input-field bg-blue-50/50"
              required
            />
          </div>

          <div className="card space-y-4">
            <h3 className="text-lg font-semibold text-pink-500 flex items-center gap-2">
              💃 Mrs. Impressive
            </h3>
            <input
              type="text"
              value={mrsName}
              onChange={(e) => setMrsName(e.target.value)}
              placeholder="Nhập tên nữ..."
              className="input-field bg-pink-50/50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting || timeLeft <= 0}
            className="btn-primary w-full py-4 text-lg shadow-xl fixed bottom-6 left-4 right-4 max-w-md mx-auto"
          >
            {submitting ? 'Đang gửi...' : 'Gửi Bình Chọn ✨'}
          </button>
        </form>
      </div>
    </div>
  );
};
