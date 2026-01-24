
import React, { useState, useEffect } from 'react';
import { Destino, UserProfile } from '../types';
import WeatherWidget from './Weather';

interface Props {
  user: UserProfile;
}

const initialDestinos: Destino[] = [
  { 
    id: '1', cidade: 'Paris', nome_ponto: 'Torre Eiffel', 
    imagem_url: 'https://picsum.photos/seed/eiffel/600/400',
    descricao: 'Símbolo icônico da França, oferece vistas panorâmicas de Paris.',
    endereco: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris',
    horario: '09:00 - 00:00',
    categoria: 'Monumento'
  },
  { 
    id: '2', cidade: 'Paris', nome_ponto: 'Museu do Louvre', 
    imagem_url: 'https://picsum.photos/seed/louvre/600/400',
    descricao: 'Maior museu de arte do mundo e um monumento histórico em Paris.',
    endereco: 'Rue de Rivoli, 75001 Paris',
    horario: '09:00 - 18:00',
    categoria: 'Cultura'
  },
  { 
    id: '3', cidade: 'Londres', nome_ponto: 'Big Ben', 
    imagem_url: 'https://picsum.photos/seed/bigben/600/400',
    descricao: 'O apelido do Grande Sino do relógio no Palácio de Westminster.',
    endereco: 'London SW1A 0AA',
    horario: 'Sempre visível',
    categoria: 'História'
  },
  { 
    id: '4', cidade: 'Roma', nome_ponto: 'Coliseu', 
    imagem_url: 'https://picsum.photos/seed/colosseum/600/400',
    descricao: 'Anfiteatro romano construído no século I d.C.',
    endereco: 'Piazza del Colosseo, 1, 00184 Roma',
    horario: '08:30 - 19:00',
    categoria: 'História'
  }
];

const GuiaView: React.FC<Props> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [visited, setVisited] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('viagemVisitados');
    if (saved) setVisited(JSON.parse(saved));
  }, []);

  const cities = ['Todas', ...new Set(initialDestinos.map(d => d.cidade))];

  const filtered = initialDestinos.filter(d => {
    const matchesCity = selectedCity === 'Todas' || d.cidade === selectedCity;
    const matchesSearch = d.nome_ponto.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const toggleVisited = (id: string) => {
    const updated = visited.includes(id) 
      ? visited.filter(v => v !== id) 
      : [...visited, id];
    setVisited(updated);
    localStorage.setItem('viagemVisitados', JSON.stringify(updated));
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Guia Turístico</h2>
          <p className="text-slate-500">Descubra os melhores pontos para visitar.</p>
        </div>
        
        <WeatherWidget defaultCity={selectedCity !== 'Todas' ? selectedCity : 'Paris'} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Buscar por nome ou categoria..." 
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {cities.map(c => (
            <button 
              key={c}
              onClick={() => setSelectedCity(c)}
              className={`
                px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all
                ${selectedCity === c ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'}
              `}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(d => (
          <div key={d.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col group">
            <div className="relative h-48 overflow-hidden">
              <img src={d.imagem_url} alt={d.nome_ponto} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 dark:bg-slate-800/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-blue-600">
                  {d.categoria}
                </span>
              </div>
              <button 
                onClick={() => toggleVisited(d.id)}
                className={`
                  absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur shadow-md transition-all
                  ${visited.includes(d.id) ? 'bg-green-500 text-white' : 'bg-white/80 dark:bg-slate-800/80'}
                `}
              >
                <i className={`fa-solid ${visited.includes(d.id) ? 'fa-check' : 'fa-location-arrow'}`}></i>
              </button>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">{d.nome_ponto}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{d.cidade}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{d.descricao}</p>
              </div>
              <div className="mt-auto space-y-2 pt-4 border-t dark:border-slate-800">
                <div className="flex items-center text-xs text-slate-500">
                  <i className="fa-regular fa-clock w-5"></i>
                  <span>{d.horario}</span>
                </div>
                <div className="flex items-start text-xs text-slate-500">
                  <i className="fa-solid fa-location-dot w-5 mt-0.5"></i>
                  <span>{d.endereco}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuiaView;
