
export type Role = 'admin' | 'user';
export type AppTheme = 'default' | 'green' | 'orange' | 'pink';

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  nome: string;
}

export interface ChecklistItem {
  id: string;
  titulo: string;
  status: boolean;
  data_limite: string;
  observacao?: string;
  criado_por: string;
}

export interface Hospedagem {
  id: string;
  cidade: string;
  hotel_name: string;
  endereco: string;
  data_chegada: string;
  data_saida: string;
  site?: string;
  telefone?: string;
  cancelamento_ate?: string;
  pagamento_ate?: string;
  status: 'confirmado' | 'aberto';
}

export interface Deslocamento {
  id: string;
  origem: string;
  destino: string;
  data: string;
  meio: 'avião' | 'trem' | 'carro';
  companhia: string;
  bilhete_numero?: string;
  status: 'pago' | 'pendente';
  observacoes?: string;
}

export interface Destino {
  id: string;
  cidade: string;
  nome_ponto: string;
  imagem_url: string;
  descricao: string;
  endereco: string;
  horario: string;
  categoria: string;
}

export interface VisitedPlace {
  user_id: string;
  destino_id: string;
}

export interface HistoricoEntry {
  id: string;
  local: string;
  data: string;
  foto_url: string;
  observacoes: string;
  criado_por: string;
}

export interface TripMember {
  id: string;
  nome: string;
  foto_url: string;
}

export interface AppConfig {
  key: string;
  value: string;
}
