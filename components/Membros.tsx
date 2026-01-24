
import React, { useState, useEffect, useRef } from 'react';
import { TripMember, UserProfile } from '../types';

interface Props {
  user: UserProfile;
}

const STORAGE_KEY = 'viagem_membros_data';

const MembrosView: React.FC<Props> = ({ user }) => {
  const isAdmin = user.role === 'admin' || user.email === 'fabiana@email.com';
  const [membros, setMembros] = useState<TripMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<TripMember>({
    id: '',
    nome: '',
    foto_url: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMembros(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar membros", e);
      }
    }
  }, []);

  const saveMembros = (newMembros: TripMember[]) => {
    setMembros(newMembros);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMembros));
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
    if (!formData.nome) return;

    if (formData.id) {
      const updated = membros.map(m => m.id === formData.id ? formData : m);
      saveMembros(updated);
    } else {
      const newMember: TripMember = {
        ...formData,
        id: Date.now().toString()
      };
      saveMembros([...membros, newMember]);
    }
    handleCloseModal();
  };

  const handleOpenModal = (m?: TripMember) => {
    if (m) {
      setFormData(m);
      setImagePreview(m.foto_url);
    } else {
      setFormData({ id: '', nome: '', foto_url: '' });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ id: '', nome: '', foto_url: '' });
    setImagePreview(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja remover este participante do grupo?')) {
      saveMembros(membros.filter(m => m.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Membros da Viagem</h2>
          <p className="text-slate-500 font-medium">Quem está embarcando nessa aventura?</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center space-x-3 shadow-xl shadow-blue-500/30 transition-all active:scale-95"
          >
            <i className="fa-solid fa-user-plus"></i>
            <span>Adicionar Membro</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {membros.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <i className="fa-solid fa-users text-5xl text-slate-200 mb-4"></i>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum participante adicionado.</p>
          </div>
        )}

        {membros.map(membro => (
          <div key={membro.id} className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-4 border-4 border-white dark:border-slate-800 shadow-lg group-hover:border-blue-500 transition-colors">
              {membro.foto_url ? (
                <img src={membro.foto_url} alt={membro.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <i className="fa-solid fa-user text-4xl"></i>
                </div>
              )}
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-center truncate w-full px-2">{membro.nome}</h3>
            
            {isAdmin && (
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(membro)} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-blue-500 hover:bg-blue-50">
                  <i className="fa-solid fa-pen text-xs"></i>
                </button>
                <button onClick={() => handleDelete(membro.id)} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-red-500 hover:bg-red-50">
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                {formData.id ? 'Editar Membro' : 'Novo Membro'}
              </h3>
              <button onClick={handleCloseModal} className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer mb-2" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-blue-500 transition-all">
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-500">
                        <i className="fa-solid fa-image text-3xl mb-1"></i>
                        <span className="text-[8px] font-black uppercase tracking-widest">Foto</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                    <i className="fa-solid fa-camera text-xs"></i>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clique para carregar foto</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Nome do Participante</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: João Silva"
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white"
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-slate-500 text-xs uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg text-xs uppercase tracking-widest transition-transform active:scale-95">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembrosView;
