# MEI App — Gestão Financeira

Aplicativo web para gestão financeira de empresas MEI.
Construído com **Next.js 14**, **Supabase** e **Tailwind CSS**.

---

## Stack

| Camada      | Tecnologia          |
|-------------|---------------------|
| Frontend    | Next.js 14 (App Router) + TypeScript |
| Estilo      | Tailwind CSS        |
| Banco       | Supabase (PostgreSQL) |
| Auth        | Supabase Auth       |
| Deploy      | Render              |
| IA (Fase 3) | Anthropic API       |

---

## Instalação local

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/mei-app.git
cd mei-app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas chaves do Supabase:
- `NEXT_PUBLIC_SUPABASE_URL` → Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Settings → API → anon public

### 4. Configure o banco de dados

No painel do Supabase, vá em **SQL Editor** e execute o arquivo:
```
mei_supabase_setup.sql
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Estrutura do projeto

```
mei-app/
├── app/
│   ├── auth/
│   │   ├── login/         # Página de login
│   │   └── cadastro/      # Página de cadastro
│   ├── dashboard/         # Painel principal (protegido)
│   ├── lancamentos/       # Gestão de lançamentos
│   ├── layout.tsx         # Layout raiz
│   └── globals.css        # Estilos globais
├── components/
│   ├── ui/                # Componentes base (botão, input...)
│   ├── forms/             # Formulários
│   └── charts/            # Gráficos (Fase 2)
├── hooks/
│   └── useUsuario.ts      # Hook de autenticação
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Cliente browser
│   │   └── server.ts      # Cliente servidor
│   ├── queries/
│   │   ├── empresas.ts    # Queries de empresas MEI
│   │   └── lancamentos.ts # Queries de lançamentos
│   └── utils.ts           # Funções utilitárias
├── types/
│   └── database.ts        # Tipos TypeScript das tabelas
├── middleware.ts           # Proteção de rotas
└── .env.example           # Template de variáveis
```

---

## Deploy no Render

1. Conecte o repositório GitHub em [render.com](https://render.com)
2. Crie um **Web Service** com:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
3. Adicione as variáveis de ambiente do Supabase
4. Cada push na `main` dispara deploy automático

---

## Roadmap

- [x] **Fase 1** — Fundação (GitHub + Supabase + Render + Next.js)
- [ ] **Fase 2** — Funcionalidades core (lançamentos, relatórios, DAS)
- [ ] **Fase 3** — IA com Anthropic API (assistente MEI)
- [ ] **Fase 4** — Escala (Cloudflare CDN + segurança)
