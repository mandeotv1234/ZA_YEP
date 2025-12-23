import React, { useState } from 'react';

interface LoginProps {
  onLogin: (domain: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      setIsLoading(true);
      onLogin(domain.trim());
    }
  };

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
          <h1 className="text-lg font-bold">Zalo YEP 2025</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 mt-10">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👋</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Xin chào!</h2>
            <p className="text-gray-500">Vui lòng nhập domain để tham gia bình chọn King & Queen</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-left">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                domain 
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Ví dụ: manh"
                className="w-full bg-gray-50 px-4 py-4 rounded-xl text-gray-800 placeholder-gray-400 font-medium outline-none focus:ring-2 focus:ring-zalo-blue/20 transition-all border border-transparent focus:border-zalo-blue/30"
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-zalo-blue text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all text-lg uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{isLoading ? 'Đang kết nối...' : 'Tham gia ngay'}</span>
            </button>
          </form>
        </div>
        
        <p className="text-center text-gray-400 text-xs mt-8 font-medium">
          © 2025 Zalo Year End Party
        </p>
      </div>
    </div>
  );
};
