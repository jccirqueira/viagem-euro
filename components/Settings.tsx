
import React from 'react';
import { AppTheme, UserProfile } from '../types';

interface Props {
  user: UserProfile;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

const SettingsView: React.FC<Props> = ({ user, currentTheme, onThemeChange }) => {
  const themes: { id: AppTheme, name: string, colors: string[], icon: string }[] = [
    { id: 'default', name: 'Oceano (Azul)', colors: ['bg-blue-600', 'bg-indigo-700'], icon: 'fa-droplet' },
    { id: 'green', name: 'Natureza (Verde)', colors: ['bg-emerald-600', 'bg-teal-700'], icon: 'fa-leaf' },
    { id: 'orange', name: 'Energia (Laranja)', colors: ['bg-orange-600', 'bg-amber-700'], icon: 'fa-fire' },
    { id: 'pink', name: 'Romance (Rosa)', colors: ['bg-pink-600', 'bg-rose-700'], icon: 'fa-heart' },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Configurações</h2>
        <p className="text-slate-500 font-medium">Personalize sua experiência na aplicação.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <i className="fa-solid fa-palette text-blue-600"></i>
          Tema da Aplicação
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`
                relative p-6 rounded-3xl border-2 transition-all text-left flex items-center justify-between group
                ${currentTheme === theme.id 
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' 
                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/30'}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${theme.colors[0]}`}>
                  <i className={`fa-solid ${theme.icon}`}></i>
                </div>
                <div>
                  <span className="font-bold block text-slate-800 dark:text-white">{theme.name}</span>
                  <div className="flex gap-1 mt-1">
                    <div className={`w-3 h-3 rounded-full ${theme.colors[0]}`}></div>
                    <div className={`w-3 h-3 rounded-full ${theme.colors[1]}`}></div>
                  </div>
                </div>
              </div>
              
              {currentTheme === theme.id && (
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] animate-in zoom-in duration-300">
                  <i className="fa-solid fa-check"></i>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t dark:border-slate-800">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
            <i className="fa-solid fa-circle-info text-slate-400"></i>
            Sobre o Perfil
          </h3>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl space-y-2">
            <p className="text-sm"><strong>Usuário:</strong> {user.nome || user.email}</p>
            <p className="text-sm"><strong>Permissão:</strong> <span className="uppercase text-[10px] font-black bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md">{user.role}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
