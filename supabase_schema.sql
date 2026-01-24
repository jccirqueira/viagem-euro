
-- 1. Tabela de Perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  nome TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Itens do Checklist
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  status BOOLEAN DEFAULT false,
  data_limite DATE,
  observacao TEXT,
  criado_por UUID REFERENCES auth.users(id),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Hospedagens
CREATE TABLE IF NOT EXISTS public.hospedagens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cidade TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  endereco TEXT,
  data_chegada DATE NOT NULL,
  data_saida DATE NOT NULL,
  site TEXT,
  telefone TEXT,
  cancelamento_ate DATE,
  pagamento_ate DATE,
  status TEXT DEFAULT 'aberto' CHECK (status IN ('confirmado', 'aberto')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Deslocamentos
CREATE TABLE IF NOT EXISTS public.deslocamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  origem TEXT NOT NULL,
  destino TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE NOT NULL,
  meio TEXT NOT NULL CHECK (meio IN ('avião', 'trem', 'carro')),
  companhia TEXT,
  bilhete_numero TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente')),
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Destinos (Guia Turístico)
CREATE TABLE IF NOT EXISTS public.destinos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cidade TEXT NOT NULL,
  nome_ponto TEXT NOT NULL,
  imagem_url TEXT,
  descricao TEXT,
  endereco TEXT,
  horario TEXT,
  categoria TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Locais Visitados
CREATE TABLE IF NOT EXISTS public.visited_places (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  destino_id UUID REFERENCES public.destinos(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, destino_id)
);

-- 7. Tabela de Membros da Viagem
CREATE TABLE IF NOT EXISTS public.trip_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  foto_url TEXT, -- Pode ser URL do Storage ou Base64
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabela de Histórico (Memórias)
CREATE TABLE IF NOT EXISTS public.historico_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  local TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  foto_url TEXT,
  observacoes TEXT,
  criado_por UUID REFERENCES auth.users(id),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Configurações Globais
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Tabela de Passeios
CREATE TABLE IF NOT EXISTS public.passeios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  horario_saida TIME NOT NULL,
  origem TEXT NOT NULL,
  locais_visitar TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security) em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospedagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deslocamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visited_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passeios ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO (RLS)
-- ... (rest of policies)
CREATE POLICY "Public read passeios" ON public.passeios FOR SELECT USING (true);
CREATE POLICY "Admin manage passeios" ON public.passeios FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Perfis: Todos autenticados podem ver, cada um edita o seu
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Itens Gerais: Todos podem ver, apenas ADMIN pode inserir/editar/deletar
-- Nota: A função 'is_admin()' ou subquery verifica o role na tabela profiles
CREATE POLICY "Public read checklist" ON public.checklist_items FOR SELECT USING (true);
CREATE POLICY "Admin manage checklist" ON public.checklist_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read hospedagens" ON public.hospedagens FOR SELECT USING (true);
CREATE POLICY "Admin manage hospedagens" ON public.hospedagens FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read deslocamentos" ON public.deslocamentos FOR SELECT USING (true);
CREATE POLICY "Admin manage deslocamentos" ON public.deslocamentos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read destinos" ON public.destinos FOR SELECT USING (true);
CREATE POLICY "Admin manage destinos" ON public.destinos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Visitas: Cada usuário gerencia as suas
CREATE POLICY "Users manage own visited" ON public.visited_places FOR ALL USING (auth.uid() = user_id);

-- Membros: Todos veem, Admin gerencia
CREATE POLICY "Public read members" ON public.trip_members FOR SELECT USING (true);
CREATE POLICY "Admin manage members" ON public.trip_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Histórico: Todos veem as memórias do grupo, mas só quem criou (ou Admin) pode deletar
CREATE POLICY "Public read history" ON public.historico_entries FOR SELECT USING (true);
CREATE POLICY "Users insert history" ON public.historico_entries FOR INSERT WITH CHECK (auth.uid() = criado_por);
CREATE POLICY "Users/Admin manage history" ON public.historico_entries FOR ALL USING (
  auth.uid() = criado_por OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Configurações: Todos veem, Admin gerencia
CREATE POLICY "Public read config" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "Admin manage config" ON public.app_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- FUNÇÕES E TRIGGERS

-- Trigger para criar perfil automaticamente no registro do Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role)
  VALUES (new.id, new.email, '', 
    CASE WHEN new.email = 'fabianacarile@gmail.com' THEN 'admin' ELSE 'user' END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove se já existir e recria
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- DADOS INICIAIS
INSERT INTO public.app_config (key, value) VALUES ('paris_arrival_date', '2025-06-15') ON CONFLICT (key) DO NOTHING;
