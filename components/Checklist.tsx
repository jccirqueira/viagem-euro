
import React, { useState, useEffect } from 'react';
import { ChecklistItem, UserProfile } from '../types';

interface Props {
  user: UserProfile;
}

const Checklist: React.FC<Props> = ({ user }) => {
  const isAdmin = user.role === 'admin';
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newLimitDate, setNewLimitDate] = useState('');

  useEffect(() => {
    // Load initial data from local storage or simulation
    const initial = [
      { id: '1', titulo: 'Passaportes válidos', status: true, data_limite: '2025-01-01', criado_por: 'admin' },
      { id: '2', titulo: 'Comprar Euros em espécie', status: false, data_limite: '2025-05-15', criado_por: 'admin' },
      { id: '3', titulo: 'Seguro Viagem contratado', status: false, data_limite: '2025-06-01', criado_por: 'admin' },
    ];
    const saved = localStorage.getItem('viagemChecklist');
    setItems(saved ? JSON.parse(saved) : initial);
  }, []);

  const saveItems = (updated: ChecklistItem[]) => {
    setItems(updated);
    localStorage.setItem('viagemChecklist', JSON.stringify(updated));
  };

  const handleToggle = (id: string) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, status: !item.status } : item
    );
    saveItems(updated);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle) return;
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      titulo: newItemTitle,
      status: false,
      data_limite: newLimitDate,
      criado_por: user.id
    };
    saveItems([...items, newItem]);
    setNewItemTitle('');
    setNewLimitDate('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este item?')) {
      saveItems(items.filter(i => i.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Checklist Pré-Viagem</h2>
        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-full text-sm font-bold">
          {items.filter(i => i.status).length}/{items.length} Concluídos
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm mb-8 border dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-500 mb-4 tracking-wider">Novo Item (Admin)</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Ex: Reservar trem Londres-Paris" 
              className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
              value={newItemTitle}
              onChange={e => setNewItemTitle(e.target.value)}
            />
            <input 
              type="date" 
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
              value={newLimitDate}
              onChange={e => setNewLimitDate(e.target.value)}
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition-all">
              Adicionar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {items.sort((a,b) => Number(a.status) - Number(b.status)).map(item => (
          <div key={item.id} className={`
            flex items-center space-x-4 p-4 rounded-2xl border transition-all
            ${item.status 
              ? 'bg-slate-100 dark:bg-slate-800/40 border-transparent opacity-60' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'}
          `}>
            <button 
              onClick={() => handleToggle(item.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                ${item.status ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}
            >
              {item.status && <i className="fa-solid fa-check"></i>}
            </button>
            
            <div className="flex-1">
              <h4 className={`font-semibold ${item.status ? 'line-through' : ''}`}>{item.titulo}</h4>
              {item.data_limite && (
                <p className="text-xs text-slate-500">
                  <i className="fa-regular fa-calendar-check mr-1"></i>
                  Limite: {new Date(item.data_limite).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>

            {isAdmin && (
              <button 
                onClick={() => handleDelete(item.id)}
                className="text-slate-400 hover:text-red-500 p-2"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Checklist;
