import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { useStore } from '../store/useStore';

type Mode = 'login' | 'signup';

export default function Login() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { login, signUp } = useStore();
  const navigate = useNavigate();

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/');
      } else {
        await signUp(email, password);
        setSuccessMsg('Conta criada! Verifique seu e-mail para confirmar o cadastro, depois faça o login.');
        switchMode('login');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ocorreu um erro';
      if (msg.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos.');
      } else if (msg.includes('Email not confirmed')) {
        setError('Confirme seu e-mail antes de entrar.');
      } else if (msg.includes('User already registered')) {
        setError('Este e-mail já está cadastrado. Faça login.');
      } else if (msg.includes('Password should be')) {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-800 border border-dark-600 mb-6 shadow-2xl">
            <Activity className="text-silver-300" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-silver-100 tracking-tight mb-2">Fusion Gestão</h1>
          <p className="text-silver-400">Controle sofisticado para o seu negócio</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-dark-800 border border-dark-600 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${mode === 'login'
                ? 'bg-dark-600 text-silver-100 shadow'
                : 'text-silver-500 hover:text-silver-300'
              }`}
          >
            <LogIn size={16} />
            Entrar
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${mode === 'signup'
                ? 'bg-dark-600 text-silver-100 shadow'
                : 'text-silver-500 hover:text-silver-300'
              }`}
          >
            <UserPlus size={16} />
            Criar Conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-800 border border-dark-600 rounded-3xl p-8 shadow-2xl">
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-silver-300 mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-silver-200 placeholder:text-silver-500 focus:outline-none focus:ring-2 focus:ring-silver-400/50 transition-all"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-silver-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 pr-12 text-silver-200 placeholder:text-silver-500 focus:outline-none focus:ring-2 focus:ring-silver-400/50 transition-all"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-silver-500 hover:text-silver-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-silver-500 mt-1">Mínimo de 6 caracteres</p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-silver-300 mb-2">
                  Confirmar Senha
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-silver-200 placeholder:text-silver-500 focus:outline-none focus:ring-2 focus:ring-silver-400/50 transition-all"
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password || (mode === 'signup' && !confirmPassword)}
              className="btn-effect w-full bg-silver-200 text-dark-900 font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <span>Entrar</span>
                  <ArrowRight size={18} />
                </>
              ) : (
                <>
                  <span>Criar Conta</span>
                  <UserPlus size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
