
import React, { useState, useEffect, useRef } from 'react';
import { Hospedagem, UserProfile } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  user: UserProfile;
}

const STORAGE_KEY = 'viagem_hospedagens_data';
const AI_CACHE_KEY = 'viagem_hospedagens_ai_cache';

const DEFAULT_INITIAL_HOSPEDAGENS: Hospedagem[] = [
  {
    id: '1',
    cidade: 'Paris',
    hotel_name: 'Hôtel Pullman Paris Tour Eiffel',
    endereco: '18 Avenue De Suffren, 75015 Paris',
    data_chegada: '2025-06-15',
    data_saida: '2025-06-19',
    cancelamento_ate: '2025-06-10',
    site: 'https://all.accor.com',
    telefone: '+33 1 44 38 56 00',
    status: 'confirmado'
  },
  {
    id: '2',
    cidade: 'Londres',
    hotel_name: 'The Tower Hotel',
    endereco: 'St Katharine\'s Way, London E1W 1LD',
    data_chegada: '2025-06-19',
    data_saida: '2025-06-22',
    cancelamento_ate: '2025-06-14',
    status: 'confirmado'
  }
];

const HospedagemView: React.FC<Props> = ({ user }) => {
  const isAdmin = user.role === 'admin' || user.email === 'fabiana@email.com';
  const [hospedagens, setHospedagens] = useState<Hospedagem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});
  const [loadingAI, setLoadingAI] = useState<Record<string, boolean>>({});
  const isInitialMount = useRef(true);

  const emptyForm: Hospedagem = {
    id: '',
    cidade: '',
    hotel_name: '',
    endereco: '',
    data_chegada: '',
    data_saida: '',
    cancelamento_ate: '',
    site: '',
    telefone: '',
    status: 'aberto'
  };

  const [formData, setFormData] = useState<Hospedagem>(emptyForm);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHospedagens(JSON.parse(saved));
      } catch (e) {
        setHospedagens(DEFAULT_INITIAL_HOSPEDAGENS);
      }
    } else {
      setHospedagens(DEFAULT_INITIAL_HOSPEDAGENS);
    }

    const savedAI = localStorage.getItem(AI_CACHE_KEY);
    if (savedAI) setAiSuggestions(JSON.parse(savedAI));
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hospedagens));
  }, [hospedagens]);

  useEffect(() => {
    localStorage.setItem(AI_CACHE_KEY, JSON.stringify(aiSuggestions));
  }, [aiSuggestions]);

  const handleOpenModal = (h?: Hospedagem) => {
    if (h) {
      setFormData({ ...h });
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
      setHospedagens(prev => prev.map(item => item.id === formData.id ? formData : item));
    } else {
      const newEntry: Hospedagem = { ...formData, id: "HOS-" + Date.now().toString() };
      setHospedagens(prev => [...prev, newEntry]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir esta hospedagem permanentemente?')) {
      setHospedagens(prev => prev.filter(h => h.id !== id));
      const newCache = { ...aiSuggestions };
      delete newCache[id];
      setAiSuggestions(newCache);
    }
  };

  const generateAISuggestions = async (h: Hospedagem) => {
    if (loadingAI[h.id]) return;
    
    // Verificação de segurança para a API KEY no GitHub Pages
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      alert("Chave de API do Gemini não configurada. Esta função de IA não está disponível no GitHub Pages sem configuração extra.");
      return;
    }

    setLoadingAI(prev => ({ ...prev, [h.id]: true }));
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const prompt = `Como um assistente de viagens especialista na Europa, analise os arredores do hotel "${h.hotel_name}" localizado em "${h.endereco}, ${h.cidade}". Liste transporte público, supermercados, farmácias, shoppings e cafeterias com horários e caminhada. Seja conciso.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }]
      });
      setAiSuggestions(prev => ({ ...prev, [h.id]: response.text || "" }));
    } catch (error) {
      alert("Erro na IA. Tente mais tarde.");
    } finally {
      setLoadingAI(prev => ({ ...prev, [h.id]: false }));
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Hospedagens</h2>
            {isAdmin && <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Admin</span>}
          </div>
          <p className="text-slate-500 font-medium">Controle de estadias e cancelamentos.</p>
        </div>
        {isAdmin && (
          <button onClick={() => handleOpenModal()} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center space-x-3 shadow-xl shadow-blue-500/30 transition-all active:scale-95">
            <i className="fa-solid fa-hotel"></i>
            <span>Novo Hotel</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-10">
        {hospedagens.map(h => (
          <div key={h.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-xl group">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-6">
                      <h3 className="text-2xl font-black uppercase tracking-tighter truncate leading-none mb-2">{h.cidade}</h3>
                      <p className="opacity-90 text-sm font-bold truncate leading-snug">{h.hotel_name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${h.status === 'confirmado' ? 'bg-green-400 text-green-950' : 'bg-amber-400 text-amber-950'}`}>
                        {h.status}
                      </span>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenModal(h)} className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all border border-white/10" title="Editar">
                            <i className="fa-solid fa-pencil text-xs"></i>
                          </button>
                          <button onClick={() => handleDelete(h.id)} className="w-10 h-10 rounded-xl bg-white/20 hover:bg-red-500 flex items-center justify-center transition-all border border-white/10" title="Excluir">
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl">
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Entrada</p>
                      <p className="font-bold text-slate-700 dark:text-slate-200">{formatDate(h.data_chegada)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Saída</p>
                      <p className="font-bold text-slate-700 dark:text-slate-200">{formatDate(h.data_saida)}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-[10px] uppercase font-black text-red-400 tracking-widest mb-1">Cancelamento até</p>
                      <p className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                        <i className="fa-solid fa-clock-rotate-left text-[10px]"></i>
                        {formatDate(h.cancelamento_ate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 text-slate-600 dark:text-slate-400">
                    <i className="fa-solid fa-location-dot mt-1 text-blue-500"></i>
                    <span className="text-sm font-medium leading-tight">{h.endereco || 'Endereço não informado'}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {h.telefone && (
                      <a href={`tel:${h.telefone}`} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black hover:text-blue-600 transition-colors flex items-center gap-2">
                        <i className="fa-solid fa-phone text-[10px]"></i>Ligar
                      </a>
                    )}
                    {h.site && (
                      <a href={h.site} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black hover:text-blue-600 transition-colors flex items-center gap-2">
                        <i className="fa-solid fa-file-contract text-[10px]"></i>Voucher
                      </a>
                    )}
                    <button onClick={() => generateAISuggestions(h)} disabled={loadingAI[h.id]} className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${loadingAI[h.id] ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'}`}>
                      {loadingAI[h.id] ? <><i className="fa-solid fa-circle-notch animate-spin"></i> Analisando...</> : <><i className="fa-solid fa-wand-magic-sparkles"></i> Arredores (IA)</>}
                    </button>
                  </div>
                </div>
              </div>

              {(aiSuggestions[h.id] || loadingAI[h.id]) && (
                <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="fa-solid fa-map-location-dot text-indigo-500"></i>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Arredores Sugeridos</h4>
                  </div>
                  {loadingAI[h.id] ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line prose dark:prose-invert prose-sm">
                      {aiSuggestions[h.id]}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border dark:border-slate-800">
            <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{formData.id ? 'Editar Hospedagem' : 'Nova Hospedagem'}</h3>
              <button onClick={handleCloseModal} className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Cidade</label>
                  <input required type="text" className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Nome do Hotel</label>
                  <input required type="text" className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" value={formData.hotel_name} onChange={e => setFormData({...formData, hotel_name: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Endereço</label>
                  <input type="text" className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" value={formData.endereco || ''} onChange={e => setFormData({...formData, endereco: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Check-in</label>
                  <input required type="date" className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" value={formData.data_chegada} onChange={e => setFormData({...formData, data_chegada: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Check-out</label>
                  <input required type="date" className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" value={formData.data_saida} onChange={e => setFormData({...formData, data_saida: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-red-500 uppercase mb-2 tracking-widest">Limite para Cancelamento Grátis</label>
                  <input type="date" className="w-full bg-red-50 dark:bg-red-900/20 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-red-500 font-bold dark:text-white" value={formData.cancelamento_ate || ''} onChange={e => setFormData({...formData, cancelamento_ate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Status</label>
                  <select className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white appearance-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="aberto">Aberto</option>
                    <option value="confirmado">Confirmado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Telefone</label>
                  <input type="text" className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" value={formData.telefone || ''} onChange={e => setFormData({...formData, telefone: e.target.value})} />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-slate-500 text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg text-xs uppercase tracking-widest transition-transform active:scale-95">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospedagemView;
