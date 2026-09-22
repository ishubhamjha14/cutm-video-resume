import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, KeyRound, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { CutmLogo } from '../common/CutmLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await login(username.trim(), password);
    setIsLoading(false);

    if (res.success) {
      setUsername('');
      setPassword('');
      onLoginSuccess();
      onClose();
    } else {
      setErrorMsg(res.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      showCloseButton={true}
    >
      <div className="flex flex-col items-center text-center">
        {/* Header Crest */}
        <div className="relative mb-3">
          <CutmLogo size={60} glow={true} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold mb-2">
          <ShieldCheck size={13} />
          <span>TEAM 03 ADMIN ACCESS</span>
        </div>

        <h3 className="text-xl font-heading font-extrabold text-slate-100">
          Admin Portal Authentication
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-6 max-w-xs">
          Sign in to manage team resumes, raw recordings, final video presentation, and QR code configurations.
        </p>

        {errorMsg && (
          <div className="w-full flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left mb-4">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5 text-left">
          <div>
            <label className="block text-xs font-mono text-slate-300 font-medium mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User size={16} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all font-sans"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 font-medium mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <KeyRound size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all font-sans"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-heading font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-xl shadow-amber-500/25 transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </Modal>
  );
};
