
import React, { useState, useEffect, useRef } from 'react';
import { Deslocamento, UserProfile } from '../types';

interface Props {
  user: UserProfile;
}

const STORAGE_KEY = 'viagem_deslocamentos_data';

const DEFAULT_DESLOCAMENTOS: Deslocamento[] = [
  { id: '1', origem: 'Brasil', destino: 'Paris', data: '2025-06-15T08:00', meio: 'avião', companhia: 'Air France', status: 'pago', bilhete_numero: 'AF123456' },
  { id: '2', origem: 'Paris', destino: 'Londres', data: '2025-06-19T10:30', meio: 'trem', companhia: 'Eurostar', status: 'pago', bilhete_numero: 'ES7890' },
  { id: '3', origem: 'Londres', destino: 'Bruxelas', data: '2025-06-22T14:00', meio: 'trem', companhia: 'Eurostar', status: 'pendente' },
];

const DeslocamentosView: React.FC<Props> = ({ user }) => {
  const isAdmin = user.role === 'admin' || user.email === 'fabiana@email.com';
  const [deslocamentos, setDeslocamentos] = useState<Deslocamento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isInitialMount = useRef(true);

  const emptyForm: Deslocamento = {
    id: '',
    origem: '',
    destino: '',
    data: '',
    meio: 'trem',
    companhia: '',
    bilhete_numero: '',
    status: 'pendente',
    observacoes: ''
  };

  const [formData, setFormData] = useState<Deslocamento>(emptyForm);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDeslocamentos(JSON.parse(saved));
      } catch (e) {
        setDeslocamentos(DEFAULT_DESLOCAMENTOS);
      }
    } else {
      setDeslocamentos(DEFAULT_DESLOCAMENTOS);
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deslocamentos));
  }, [deslocamentos]);

  const handleOpenModal = (d?: Deslocamento) => {
    if (d) {
      setFormData({ ...d });
    } else {
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      setDeslocamentos(prev => prev.map(item => item.id === formData.id ? formData : item));
    } else {
      const newEntry: Deslocamento = { ...formData, id: "TRA-" + Date.now().toString() };
      setDeslocamentos(prev => [...prev, newEntry]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este deslocamento permanentemente?')) {
      setDeslocamentos(prev => prev.filter(d => d.id !== id));
    }
  };

  const sortedDeslocamentos = [...deslocamentos].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Deslocamentos</h2>
            {isAdmin && <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Admin</span>}
          </div>
          <p className="text-slate-500 font-medium">Cronograma de viagens entre cidades e países.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center space-x-3 shadow-xl shadow-indigo-500/30 transition-all active:scale-95"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Adicionar Trajeto</span>
          </button>
        )}
      </div>

      <div className="relative border-l-4 border-indigo-100 dark:border-slate-800 ml-6 space-y-12">
        {sortedDeslocamentos.length === 0 && (
          <div className="pl-10 py-10 text-slate-400 italic font-medium">Nenhum trajeto cadastrado.</div>
        )}
        
        {sortedDeslocamentos.map((d) => (
          <div key={d.id} className="relative pl-12 group">
            {/* Timeline dot */}
            <div className={`
              absolute -left-[14px] top-0 w-6 h-6 rounded-full border-4 border-slate-50 dark:border-slate-950 transition-all group-hover:scale-110 shadow-sm
              ${d.status === 'pago' ? 'bg-green-500' : 'bg-amber-500'}
            `}></div>
            
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900/30">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">{d.origem}</div>
                  <div className="flex flex-col items-center">
                    <i className={`fa-solid ${d.meio === 'avião' ? 'fa-plane' : d.meio === 'carro' ? 'fa-car' : 'fa-train'} text-indigo-500 text-xl animate-pulse`}></i>
                    <div className="h-0.5 w-8 bg-slate-200 dark:bg-slate-700 my-1"></div>
                  </div>
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">{d.destino}</div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${d.status === 'pago' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {d.status}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(d)} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center justify-center transition-all border border-transparent hover:border-indigo-100">
                        <i className="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center transition-all border border-transparent hover:border-red-100">
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data e Hora</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {new Date(d.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{d.companhia || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transporte</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{d.meio}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Referência</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{d.bilhete_numero || '---'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDIÇÃO/CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">{formData.id ? 'Editar Trajeto' : 'Novo Trajeto'}</h3>
                <p className="text-xs font-medium text-slate-500">Preencha os dados do deslocamento.</p>
              </div>
              <button onClick={handleCloseModal} className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Origem</label>
                  <input required type="text" className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white" value={formData.origem} onChange={e => setFormData({...formData, origem: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Destino</label>
                  <input required type="text" className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white" value={formData.destino} onChange={e => setFormData({...formData, destino: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Data e Hora</label>
                  <input required type="datetime-local" className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Meio</label>
                  <select className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white appearance-none" value={formData.meio} onChange={e => setFormData({...formData, meio: e.target.value as any})}>
                    <option value="avião">Avião</option>
                    <option value="trem">Trem</option>
                    <option value="carro">Carro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Empresa/Companhia</label>
                  <input type="text" className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white" value={formData.companhia || ''} onChange={e => setFormData({...formData, companhia: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Cód. Reserva/Bilhete</label>
                  <input type="text" className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white" value={formData.bilhete_numero || ''} onChange={e => setFormData({...formData, bilhete_numero: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Status</label>
                  <select className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white appearance-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="pendente">Pendente</option>
                    <option value="pago">Confirmado / Pago</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-slate-500 text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-[2] py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 text-xs uppercase tracking-widest transition-transform active:scale-95">
                  Salvar Deslocamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeslocamentosView;
