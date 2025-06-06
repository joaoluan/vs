const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const helmet = require('helmet');
const app = express();
const PORT = process.env.PORT || 3000;

// Segurança HTTP com helmet
app.use(helmet());

// Limita tamanho do body para 10kb
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuração de sessão
app.use(session({
  secret: 'secret-key-vigilancia-solidaria',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 dia
}));

// Middleware para proteger rotas que precisam de autenticação
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    return res.redirect('/login');
  }
  next();
};

// Middleware para tratar erros JSON
const handleJsonError = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  next();
};

app.use(handleJsonError);

// ROTAS API PRIMEIRO (antes das rotas de arquivo)
// Rota POST para cadastro
app.post('/api/cadastro', (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'As senhas não coincidem' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }

    const usersFile = path.join(__dirname, 'data', 'users.json');
    let users = [];

    try {
      if (fs.existsSync(usersFile)) {
        const usersData = fs.readFileSync(usersFile, 'utf-8');
        users = JSON.parse(usersData);
      }
    } catch (err) {
      console.error('Erro ao ler arquivo de usuários:', err);
      users = [];
    }

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const newUser = { id: Date.now(), name, email, phone, password };
    users.push(newUser);

    try {
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
      res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      return res.status(500).json({ error: 'Erro ao salvar usuário' });
    }
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota POST para login
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const usersFile = path.join(__dirname, 'data', 'users.json');
    let users = [];

    try {
      if (fs.existsSync(usersFile)) {
        const usersData = fs.readFileSync(usersFile, 'utf-8');
        users = JSON.parse(usersData);
      }
    } catch (err) {
      console.error('Erro ao ler arquivo de usuários:', err);
      return res.status(500).json({ error: 'Erro ao ler dados dos usuários' });
    }

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.json({ success: true, message: 'Login realizado com sucesso' });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.json({ success: true, message: 'Logout realizado com sucesso' });
  });
});

// Rota GET para listar alertas
app.get('/api/alertas', requireAuth, (req, res) => {
  try {
    const alertsFile = path.join(__dirname, 'data', 'alerts.json');
    if (!fs.existsSync(alertsFile)) {
      return res.json([]); // Sem alertas ainda
    }

    const alertData = fs.readFileSync(alertsFile, 'utf-8');
    const alertas = JSON.parse(alertData);

    // Retorna os alertas mais recentes primeiro
    const recentes = alertas.sort((a, b) => new Date(b.horario) - new Date(a.horario)).slice(0, 10);
    res.json(recentes);
  } catch (error) {
    console.error('Erro ao ler alertas:', error);
    res.status(500).json({ error: 'Erro ao carregar alertas' });
  }
});

// Rota para obter dados do usuário logado
app.get('/api/user', requireAuth, (req, res) => {
  res.json({ user: req.session.user });
});

// Rota POST para receber alertas (do Home Assistant ou simulação)
app.post('/api/alerta', requireAuth, (req, res) => {
  try {
    console.log('Recebendo alerta:', req.body); // Log para debug
    
    const { cameraId, mensagem, horario } = req.body;

    if (!cameraId || !mensagem || !horario) {
      console.log('Campos faltando:', { cameraId, mensagem, horario });
      return res.status(400).json({ error: 'Campos obrigatórios: cameraId, mensagem e horario' });
    }

    const alertsFile = path.join(__dirname, 'data', 'alerts.json');
    let alerts = [];

    try {
      if (fs.existsSync(alertsFile)) {
        const alertsData = fs.readFileSync(alertsFile, 'utf-8');
        if (alertsData.trim()) {
          alerts = JSON.parse(alertsData);
        }
      }
    } catch (err) {
      console.error('Erro ao ler arquivo de alertas:', err);
      alerts = []; // Começa com array vazio se houver erro
    }

    const novoAlerta = {
      id: Date.now(),
      cameraId,
      mensagem,
      horario,
      recebidoEm: new Date().toISOString(),
      timestamp: Date.now()
    };

    alerts.push(novoAlerta);
    console.log('Salvando alerta:', novoAlerta); // Log para debug

    try {
      // Garantir que o diretório data existe
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      fs.writeFileSync(alertsFile, JSON.stringify(alerts, null, 2), 'utf-8');
      console.log('Alerta salvo com sucesso'); // Log para debug
      res.status(201).json({ message: 'Alerta registrado com sucesso', alerta: novoAlerta });
    } catch (err) {
      console.error('Erro ao salvar alerta:', err);
      return res.status(500).json({ error: 'Erro ao salvar alerta' });
    }
  } catch (error) {
    console.error('Erro geral no alerta:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ROTAS DE ARQUIVO (depois das rotas API)
// Rotas públicas
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/cadastro', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

// Rota dashboard protegida
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Middleware para rotas não encontradas (DEVE SER O ÚLTIMO)
app.use((req, res) => {
  // Se for uma rota de API, retorna JSON
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'Rota não encontrada' });
  }
  // Se for uma rota de página, retorna HTML
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Middleware para tratamento de erros gerais
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
  res.status(500).send('Erro interno do servidor');
});

// Inicializa arquivos JSON e diretórios se não existirem
async function initializeServer() {
  try {
    const dataDir = path.join(__dirname, 'data');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('Diretório data criado');
    }

    const usersFile = path.join(dataDir, 'users.json');
    if (!fs.existsSync(usersFile)) {
      fs.writeFileSync(usersFile, '[]', 'utf-8');
      console.log('Arquivo users.json criado');
    }

    const alertsFile = path.join(dataDir, 'alerts.json');
    if (!fs.existsSync(alertsFile)) {
      fs.writeFileSync(alertsFile, '[]', 'utf-8');
      console.log('Arquivo alerts.json criado');
    }

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar servidor:', error);
    process.exit(1);
  }
}

initializeServer();

module.exports = { requireAuth };