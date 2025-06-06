document.addEventListener('DOMContentLoaded', function() {
  // Mostrar/ocultar senha
  const togglePassword = document.getElementById('togglePassword');
  const password = document.getElementById('password');
  
  togglePassword.addEventListener('click', function() {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.classList.toggle('bi-eye-fill');
    this.classList.toggle('bi-eye-slash-fill');
  });
  
  // Validação do formulário
  const loginForm = document.getElementById('loginForm');
  const alertError = document.getElementById('alertError');
  
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirecionar para dashboard após login bem-sucedido
        window.location.href = '/dashboard';
      } else {
        alertError.textContent = data.error || 'Credenciais inválidas';
        alertError.style.display = 'block';
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      alertError.textContent = 'Erro ao conectar com o servidor';
      alertError.style.display = 'block';
    }
  });
  
  // Efeito hover nos botões
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
    });
  });
});
