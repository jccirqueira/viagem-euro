
import React, { useState, useEffect, useRef } from 'react';
import { HistoricoEntry, UserProfile } from '../types';

interface Props {
  user: UserProfile;
}

const STORAGE_KEY = 'viagem_historico_data';

const HistoricoView: React.FC<Props> = ({ user }) => {
  const [entries, setEntries] = useState<HistoricoEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    local: '',
    observacoes: '',
    foto_url: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar histórico", e);
      }
    }
  }, []);

  const saveEntries = (newEntries: HistoricoEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData(prev => ({ ...prev, foto_url: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.foto_url && !formData.observacoes) return;

    const newEntry: HistoricoEntry = {
      id: Date.now().toString(),
      local: formData.local || 'Momento da Viagem',
      data: new Date().toISOString(),
      foto_url: formData.foto_url,
      observacoes: formData.observacoes,
      criado_por: user.id
    };

    saveEntries([newEntry, ...entries]);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ local: '', observacoes: '', foto_url: '' });
    setImagePreview(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir esta memória permanentemente?')) {
      saveEntries(entries.filter(e => e.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Histórico da Viagem</h2>
          <p className="text-slate-500 font-medium">Guarde suas melhores memórias e fotos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center space-x-3 shadow-xl shadow-blue-500/30 transition-all active:scale-95"
        >
          <i className="fa-solid fa-camera"></i>
          <span>Nova Memória</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entries.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <i className="fa-solid fa-images text-5xl text-slate-200 mb-4"></i>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhuma memória registrada ainda.</p>
          </div>
        )}

        {entries.map(entry => (
          <div key={entry.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-xl group flex flex-col">
            {entry.foto_url && (
              <div className="relative h-64 overflow-hidden">
                <img src={entry.foto_url} alt={entry.local} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4 flex gap-2">
                   <button onClick={() => handleDelete(entry.id)} className="w-10 h-10 rounded-full bg-red-500/80 text-white backdrop-blur flex items-center justify-center hover:bg-red-600 transition-colors">
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>
              </div>
            )}
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{entry.local}</h3>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                    {new Date(entry.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">
                "{entry.observacoes}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">Nova Memória</h3>
              <button onClick={handleCloseModal} className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  {imagePreview ? (
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden border-2 border-blue-500">
                      <img src={imagePreview} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, foto_url: '' })); }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all group"
                    >
                      <i className="fa-solid fa-camera text-4xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <span className="text-[10px] font-black uppercase tracking-widest">Tirar Foto / Galeria</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Local / Título</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Pôr do sol na Torre Eiffel"
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white"
                    value={formData.local}
                    onChange={e => setFormData({...formData, local: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Observações</label>
                  <textarea 
                    rows={4}
                    placeholder="Escreva algo sobre este momento..."
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white resize-none"
                    value={formData.observacoes}
                    onChange={e => setFormData({...formData, observacoes: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-slate-500 text-xs uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg text-xs uppercase tracking-widest transition-transform active:scale-95">Salvar Memória</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricoView;
