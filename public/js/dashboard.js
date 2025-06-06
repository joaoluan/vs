let camerasAtivas = [];

function carregarAlertasRecentes() {
  fetch('/api/alertas')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Alertas carregados:', data);
      const recentAlertsDiv = document.getElementById('recentAlerts');
      const alertCountSpan = document.getElementById('alertCount');
      const todayAlertsSpan = document.getElementById('todayAlerts');

      recentAlertsDiv.innerHTML = '';

      const agora = new Date();
      const hoje = agora.toISOString().split('T')[0];

      if (Array.isArray(data) && data.length > 0) {
        // Filtra alertas por horário noturno (18h às 7h)
        const alertasFiltrados = data.filter(alerta => {
          const dataAlerta = new Date(alerta.horario);
          const hora = dataAlerta.getHours();
          return hora >= 18 || hora < 7;
        });

        // Conta alertas de hoje
        const alertasHoje = data.filter(alerta => {
          const dataAlerta = new Date(alerta.horario);
          const dataHojeAlerta = dataAlerta.toISOString().split('T')[0];
          return dataHojeAlerta === hoje;
        });

        // Atualiza contadores
        alertCountSpan.textContent = data.length;
        todayAlertsSpan.textContent = alertasHoje.length;

        // Mostra alertas (todos ou apenas noturnos, você pode escolher)
        const alertasParaMostrar = data; // ou alertasFiltrados se quiser apenas noturnos

        if (alertasParaMostrar.length > 0) {
          alertasParaMostrar.forEach(alerta => {
            const alertaDiv = document.createElement('div');
            alertaDiv.classList.add('alerta-item');
            
            const dataFormatada = new Date(alerta.horario).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            
            alertaDiv.innerHTML = `
              <div style="padding: 10px; border: 1px solid #ddd; margin: 5px 0; border-radius: 5px; background: #f9f9f9;">
                <strong>📹 ${alerta.cameraId}</strong><br>
                <span>${alerta.mensagem}</span><br>
                <small style="color: #666;">🕒 ${dataFormatada}</small>
              </div>
            `;
            recentAlertsDiv.appendChild(alertaDiv);
          });
        } else {
          recentAlertsDiv.innerHTML = '<p style="text-align: center; color: #666;">Nenhum alerta encontrado</p>';
        }
      } else {
        alertCountSpan.textContent = '0';
        todayAlertsSpan.textContent = '0';
        recentAlertsDiv.innerHTML = '<p style="text-align: center; color: #666;">Nenhum alerta registrado ainda</p>';
      }
    })
    .catch(err => {
      console.error('Erro ao carregar alertas:', err);
      const recentAlertsDiv = document.getElementById('recentAlerts');
      recentAlertsDiv.innerHTML = '<p style="color: red;">Erro ao carregar alertas</p>';
    });
}

function simularAlerta() {
  console.log('Simulando alerta...');
  
  // Usar uma câmera ativa se disponível, senão usar padrão
  const cameraId = camerasAtivas.length > 0 ? camerasAtivas[Math.floor(Math.random() * camerasAtivas.length)] : 'CAM-001';
  const agora = new Date();
  const horario = agora.toISOString();
  
  // Mensagens variadas para simulação
  const mensagens = [
    'Movimento detectado na entrada principal',
    'Pessoa não identificada detectada',
    'Atividade suspeita registrada',
    'Movimento detectado no jardim',
    'Câmera ativada por sensor de movimento'
  ];
  
  const mensagem = mensagens[Math.floor(Math.random() * mensagens.length)];

  const alertData = {
    cameraId: cameraId,
    mensagem: mensagem,
    horario: horario
  };

  console.log('Enviando alerta:', alertData);

  fetch('/api/alerta', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(alertData)
  })
    .then(response => {
      console.log('Resposta do servidor:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Resposta do alerta:', data);
      if (data.message || data.alerta) {
        alert('✅ Alerta simulado com sucesso!');
        // Recarrega os alertas após 500ms para dar tempo do servidor salvar
        setTimeout(() => {
          carregarAlertasRecentes();
        }, 500);
      } else {
        alert('⚠️ Erro ao simular alerta: ' + (data.error || 'Erro desconhecido'));
      }
    })
    .catch(err => {
      console.error('Erro ao enviar alerta:', err);
      alert('❌ Erro ao enviar alerta: ' + err.message);
    });
}

function simularCameraAtiva() {
  const novaCameraId = `CAM-${String(camerasAtivas.length + 1).padStart(3, '0')}`;
  camerasAtivas.push(novaCameraId);

  // Atualiza contadores
  document.getElementById('cameraCount').textContent = `${camerasAtivas.length} câmeras conectadas`;
  document.getElementById('activeCameras').textContent = camerasAtivas.length;

  // Atualiza lista de câmeras
  const cameraList = document.getElementById('cameraList');
  const cameraItem = document.createElement('div');
  cameraItem.style.cssText = 'padding: 5px; background: #e8f5e8; margin: 2px 0; border-radius: 3px;';
  cameraItem.innerHTML = `📹 ${novaCameraId} - <span style="color: green;">●</span> Online`;
  cameraList.appendChild(cameraItem);

  console.log('Nova câmera adicionada:', novaCameraId);
}

function showNotifications() {
  alert('🔔 Central de Notificações\n\nVerifique os alertas recentes abaixo no dashboard.');
}

function logout() {
  fetch('/api/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      window.location.href = '/login.html';
    } else {
      alert('Erro ao fazer logout');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    alert('Erro ao fazer logout');
  });
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard carregado');
  
  // Adiciona event listeners
  const simulateAlertBtn = document.getElementById('simulateAlertBtn');
  const simulateCameraBtn = document.getElementById('simulateCameraBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (simulateAlertBtn) {
    simulateAlertBtn.addEventListener('click', simularAlerta);
    console.log('Event listener do botão de alerta adicionado');
  } else {
    console.error('Botão de simular alerta não encontrado');
  }
  
  if (simulateCameraBtn) {
    simulateCameraBtn.addEventListener('click', simularCameraAtiva);
    console.log('Event listener do botão de câmera adicionado');
  } else {
    console.error('Botão de simular câmera não encontrado');
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
    console.log('Event listener do botão de logout adicionado');
  } else {
    console.error('Botão de logout não encontrado');
  }

  // Carrega alertas iniciais
  carregarAlertasRecentes();

  // Adiciona algumas câmeras por padrão para demonstração
  setTimeout(() => {
    simularCameraAtiva(); // CAM-001
    simularCameraAtiva(); // CAM-002
  }, 1000);

  // Atualiza alertas a cada 30 segundos
  setInterval(carregarAlertasRecentes, 30000);
});

// Função global para o botão de notificações no header
window.showNotifications = showNotifications;