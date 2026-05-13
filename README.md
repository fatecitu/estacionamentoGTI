# Estacionamento

Sistema web simples para controle de estacionamento, com autenticacao pelo Supabase e cadastros de modelos e veiculos.

## Funcionalidades

- Login e cadastro de usuarios com Supabase Auth.
- Menu protegido por sessao.
- CRUD de marcas e modelos de veiculos.
- CRUD de veiculos com placa, modelo, ano, observacao e data de saida.
- Busca nas listagens de modelos e veiculos.
- Interface criada com Vite e Tailwind CSS.

## Tecnologias

- Vite
- JavaScript
- Tailwind CSS
- Supabase

## Requisitos

- Node.js instalado.
- Projeto criado no Supabase.
- Tabelas e politicas configuradas no banco do Supabase.

## Configuracao do Supabase

1. No painel do Supabase, abra o SQL Editor.
2. Execute o script em `src/sql/tables.sql`.
3. Copie a URL do projeto e a chave publica do Supabase.
4. Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_KEY=sua_chave_publica_do_supabase
```

O arquivo `.env` nao deve ser enviado para o repositorio.

## Como Executar

Instale as dependencias:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Depois, acesse a URL exibida no terminal.

## Scripts Disponiveis

- `npm run dev`: inicia o projeto em modo desenvolvimento.
- `npm run build`: gera a versao de producao em `dist`.
- `npm run preview`: executa uma previa local da build.

## Estrutura

```text
.
|-- index.html          # Login
|-- novo.html           # Cadastro de usuario
|-- menu.html           # Menu principal
|-- modelos.html        # Cadastro de marcas e modelos
|-- veiculos.html       # Cadastro de veiculos
|-- src/
|   |-- main.js         # Login
|   |-- novo.js         # Cadastro de usuario
|   |-- menu.js         # Validacao de sessao e logout
|   |-- modelos.js      # CRUD de modelos
|   |-- veiculos.js     # CRUD de veiculos
|   |-- supabase.js     # Cliente Supabase
|   |-- style.css       # Estilos Tailwind
|   `-- sql/tables.sql  # Script do banco
`-- vite.config.js      # Configuracao das entradas HTML
```

## Fluxo de Uso

1. Cadastre um usuario em `novo.html` ou faca login em `index.html`.
2. Acesse o menu principal.
3. Cadastre primeiro os modelos de veiculos.
4. Cadastre os veiculos usando um dos modelos disponiveis.

## Observacoes

- As paginas internas validam a sessao do usuario e redirecionam para o login quando nao ha sessao ativa.
- As politicas do banco liberam acesso apenas para usuarios autenticados.
- A placa do veiculo e normalizada para letras maiusculas e limitada a 7 caracteres.
