
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const AuthScreen: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation of Auth logic
    // Admin check logic: only 'fabiana@email.com' is admin
    const role = email === 'fabiana@email.com' ? 'admin' : 'user';
    onLogin({ id: 'some-id', email, role, nome: email.split('@')[0] });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 transform transition-all">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <i className="fa-solid fa-earth-europe text-4xl text-blue-600"></i>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">ViagemEuro</h1>
          <p className="text-slate-500 dark:text-slate-400">Organize sua jornada europeia</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="exemplo@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Senha</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
          >
            {isLogin ? 'Entrar Agora' : 'Criar Minha Conta'}
          </button>
        </form>

        <div className="mt-8 text-center border-t pt-6 dark:border-slate-800">
          <p className="text-sm text-slate-500 mb-2">
            {isLogin ? 'Novo por aqui?' : 'Já possui conta?'}
          </p>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-bold hover:underline"
          >
            {isLogin ? 'Solicitar acesso / Registrar' : 'Voltar ao Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
