import React, { useState } from 'react';

interface LoginProps {
  onLogin: (domain: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [domain, setDomain] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      onLogin(domain.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="card w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-zalo-blue mb-2">Zalo YEP 2024</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-8">Mr & Mrs Best Dressed</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-left text-sm font-medium text-gray-600 mb-2">
              Nhập Domain của bạn
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Ví dụ: namnt"
              className="input-field"
              required
            />
          </div>
          
          <button type="submit" className="btn-primary w-full">
            Tham gia
          </button>
        </form>
      </div>
    </div>
  );
};
