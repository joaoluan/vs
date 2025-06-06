# Vigilância Solidária

**Vigilância Solidária** é uma aplicação web que simula um sistema colaborativo de monitoramento entre vizinhos, onde câmeras IP podem ser conectadas e alertas de segurança são registrados e exibidos em tempo real. O sistema permite cadastro de usuários, login protegido por sessão e uma dashboard interativa para visualização de alertas e câmeras ativas.

## Funcionalidades

- Cadastro e login de usuários com validações básicas.
- Proteção de rotas com autenticação de sessão.
- Dashboard protegida com simulação de alertas e câmeras.
- Armazenamento dos dados em arquivos locais (`users.json` e `alerts.json`).
- Interface responsiva com jQuery e Bootstrap.
- Middleware para segurança (Helmet) e tratamento de erros.
- Alertas simulados são armazenados no backend via API.

## Estrutura de Pastas

```
Desafio desenvolvimento web/
├── data/
│   ├── users.json                  # Dados dos usuários cadastrados
│   └── alerts.json                 # Dados dos alertas registrados
├── public/
│   ├── css/                        # Arquivos CSS
│   ├── js/                         # Scripts JavaScript do front-end
│   ├── index.html                  # Página inicial pública
│   ├── login.html                  # Página de login
│   ├── cadastro.html               # Página de cadastro de usuários
│   ├── dashboard.html              # Página principal após login
│   └── 404.html                    # Página de erro 404
├── package.json                    # Dependências e scripts do projeto
├── server.js                       # Servidor Node.js com Express
└── README.md                       # Documentação do projeto
```


---

## Como Executar o Projeto

### Requisitos

- Node.js instalado (versão 14+ recomendada)
- npm (gerenciador de pacotes do Node)

### Passos para executar localmente

1. **Descompacte a pasta `.zip` do projeto** no local desejado.

2. **Abra um terminal na pasta do projeto.**

3. **Instale as dependências:**

```bash
npm install express body-parser express-session helmet
node server.js

    Abra o navegador e acesse:

http://localhost:3000


```

## Endpoints da API

| Método | Rota                 | Descrição                          |
|--------|----------------------|------------------------------------|
| POST   | /api/cadastro        | Cadastra um novo usuário           |
| POST   | /api/login           | Realiza login e cria sessão        |
| POST   | /api/logout          | Faz logout e encerra a sessão      |
| GET    | /api/user            | Retorna dados do usuário logado    |
| POST   | /api/simular-alerta  | Registra um novo alerta simulado   |

## Requisitos

- Node.js 18+
- Navegador moderno

## Observações

- Os dados de usuários e alertas são armazenados em arquivos JSON locais.
- O projeto simula uma aplicação real de segurança comunitária, mas não está integrado a câmeras reais.
- Ideal para fins didáticos e prototipagem de ideias para smart cities e automação residencial.

## Autor

João Moura  
Estudante de Análise e Desenvolvimento de Sistemas  