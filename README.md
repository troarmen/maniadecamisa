# Mania de Camisa — Controle de Gastos

Plataforma web para o dono da loja **Mania de Camisa** (camisas antigas de
futebol) registrar entradas e saídas, separar o que é da loja e o que é
pessoal, e enxergar o lucro real através de gráficos.

## ✨ Funcionalidades

- **Login com e-mail e senha** — cada usuário só vê os próprios dados.
- **Lançamentos** — entradas (vendas) e saídas (custos), com categoria,
  item, valor, data e observação.
- **Loja x Pessoal** — abas separadas para não misturar o financeiro da
  loja com os gastos pessoais (aluguel, convênio etc.).
- **Resumo do mês** — entradas, saídas e o resultado (faturamento − gastos).
- **Gráficos que mudam de visualização** — por categoria em **pizza** ou
  **barras**, e evolução dos últimos 6 meses em **barras** ou **linha**.
- **Categorias personalizáveis** — o dono cria/edita/exclui categorias.
- **Custos fixos** — marque aluguel, internet etc. como fixos e use o botão
  "Repetir fixos" para copiar de um mês para o outro.
- **Visual da marca** — azul-claro e branco, layout pensado para computador
  mas responsivo no celular.

## 🧱 Tecnologias

- **Front-end:** React + Vite + TypeScript + Tailwind CSS
- **Gráficos:** Recharts
- **Back-end:** Supabase (PostgreSQL + autenticação)
- **Hospedagem:** o front-end gera arquivos estáticos → sobe na Hostinger

---

## 1. Pré-requisitos

- [Node.js](https://nodejs.org) 18 ou superior
- Uma conta gratuita no [Supabase](https://supabase.com)
- Uma conta de hospedagem na Hostinger (para publicar)

## 2. Configurar o Supabase

1. Acesse <https://supabase.com> e crie um novo projeto (anote a senha do
   banco). Aguarde alguns minutos até o projeto ficar pronto.
2. No menu lateral, abra **SQL Editor** → **New query**.
3. Copie todo o conteúdo do arquivo [`supabase/schema.sql`](supabase/schema.sql),
   cole no editor e clique em **Run**. Isso cria as tabelas, a segurança
   (cada usuário vê só os próprios dados) e as categorias padrão.
4. Vá em **Project Settings → API** e copie:
   - **Project URL** → será o `VITE_SUPABASE_URL`
   - **anon public key** → será o `VITE_SUPABASE_ANON_KEY`
5. (Opcional, recomendado para uso de uma só pessoa) Em
   **Authentication → Providers → Email**, desative **"Confirm email"**.
   Assim o dono entra direto após criar a conta, sem precisar confirmar
   o e-mail. Se preferir manter ativo, basta confirmar pelo e-mail recebido.

## 3. Rodar no seu computador

```bash
# 1. Instalar as dependências
npm install

# 2. Criar o arquivo de credenciais
cp .env.example .env
#    Edite o .env e preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 3. Iniciar em modo de desenvolvimento
npm run dev
```

Abra o endereço mostrado no terminal (ex.: `http://localhost:5173`),
clique em **Criar conta** e cadastre o e-mail/senha do dono da loja.
As categorias padrão já aparecem prontas para uso.

> Depois de criar a conta do dono, você pode desativar novos cadastros em
> **Supabase → Authentication → Sign In / Providers → "Allow new users to
> sign up"**.

## 4. Gerar o site para publicar

```bash
npm run build
```

Isso cria a pasta **`dist/`** com o site pronto (arquivos estáticos).

## 5. Publicar na Hostinger

1. Entre no **hPanel** da Hostinger → **Gerenciador de Arquivos**.
2. Abra a pasta **`public_html`** (apague arquivos de exemplo, se houver).
3. Envie **todo o conteúdo de dentro da pasta `dist/`** (o arquivo
   `index.html`, a pasta `assets/`, o `favicon.svg` etc.) para dentro de
   `public_html`.
   - Dica: compacte o conteúdo do `dist/` em um `.zip`, faça upload e use
     "Extrair" no Gerenciador de Arquivos.
4. Acesse o seu domínio — a plataforma já estará no ar.

> O projeto usa caminhos relativos (`base: './'`), então funciona tanto na
> raiz do domínio quanto dentro de uma subpasta.

### Atualizações futuras

Sempre que mudar algo no código: rode `npm run build` de novo e substitua
os arquivos dentro de `public_html` pelos novos da pasta `dist/`.

---

## 📂 Estrutura do projeto

```
mania-de-camisa/
├── supabase/schema.sql      # Script do banco de dados (rodar no Supabase)
├── src/
│   ├── components/          # Cards, gráficos, formulários, modais
│   ├── context/             # Autenticação (login)
│   ├── lib/                 # Supabase, formatação de R$, datas
│   ├── pages/               # Login e Dashboard
│   ├── types.ts             # Tipos do sistema
│   └── main.tsx             # Ponto de entrada
├── .env.example             # Modelo das credenciais do Supabase
└── README.md
```

## ❓ Problemas comuns

- **"Configuração pendente"** na tela — o arquivo `.env` não existe ou está
  sem as chaves. Confira o passo 3.
- **"Não foi possível carregar os dados"** — o `schema.sql` não foi
  executado no Supabase. Refaça o passo 2.
- **Não consigo entrar após criar a conta** — a confirmação de e-mail está
  ativa. Confirme pelo e-mail recebido ou desative em
  Authentication → Providers → Email (passo 2.5).
