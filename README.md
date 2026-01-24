
# ViagemEuro - Organização de Viagem

Esta aplicação é um guia turístico e gerenciador de pré-viagem para o grupo Euro.

## Como Conectar ao Supabase

1. Crie um projeto no [Supabase](https://supabase.com).
2. Vá em **Project Settings** > **API**.
3. Obtenha a `Project URL` e a `anon key`.
4. Utilize o script SQL fornecido no arquivo `supabase_schema.sql` no **SQL Editor** do Supabase para criar as tabelas e políticas de segurança (RLS).
5. No código (arquivo `script.js` ou cliente Supabase), inicialize com:
   ```javascript
   const supabase = supabase.createClient(URL, KEY);
   ```

## Autenticação e RLS

- A autenticação deve ser feita via Email/Senha.
- A política de RLS incluída no SQL garante que apenas usuários autenticados possam ler os dados e apenas a **Fabiana** (admin) possa editar, baseando-se no campo `role` da tabela `profiles`.

## Hospedagem no GitHub Pages

1. Faça o commit de todos os arquivos (`index.html`, `style.css`, `script.js`) para um repositório no GitHub.
2. Vá em **Settings** > **Pages**.
3. Em "Build and deployment", selecione a branch `main`.
4. Sua aplicação estará disponível em `https://seu-usuario.github.io/nome-do-repo/`.

## Funcionalidades
- **Checklist**: Gerenciamento de tarefas (Admin adiciona, todos marcam).
- **Hospedagem**: Visualização por cidade.
- **Deslocamentos**: Linha do tempo visual.
- **Guia**: Pontos turísticos com status de visitado.
- **Previsão**: Integração (via simulação) com clima local.
- **Dark Mode**: Ajuste automático conforme o sistema.
