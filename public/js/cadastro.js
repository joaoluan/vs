document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const registerForm = document.getElementById('registerForm');
  const alertError = document.getElementById('alertError');
  const alertSuccess = document.getElementById('alertSuccess');
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const phoneInput = document.getElementById('phone');

  // Mostrar/ocultar senha
  togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('bi-eye-fill');
    this.classList.toggle('bi-eye-slash-fill');
  });

  // Mostrar/ocultar confirmação de senha
  toggleConfirmPassword.addEventListener('click', function() {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    this.classList.toggle('bi-eye-fill');
    this.classList.toggle('bi-eye-slash-fill');
  });

  // Máscara para telefone
  phoneInput.addEventListener('input', function(e) {
    const value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    
    if (value.length > 0) {
      formattedValue = '(' + value.substring(0, 2);
    }
    if (value.length > 2) {
      formattedValue += ') ' + value.substring(2, 7);
    }
    if (value.length > 7) {
      formattedValue += '-' + value.substring(7, 11);
    }
    
    e.target.value = formattedValue;
  });

  // Efeito hover nos botões
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
    });
  });

  // Submit do formulário
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Esconder alertas anteriores
    alertError.style.display = 'none';
    alertSuccess.style.display = 'none';
    
    // Obter valores dos campos
    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      password: document.getElementById('password').value,
      confirmPassword: document.getElementById('confirmPassword').value
    };
    
    // Validação básica
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      showError('Por favor, preencha todos os campos.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      showError('As senhas não coincidem.');
      return;
    }
    
    if (formData.password.length < 6) {
      showError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const response = await fetch('/api/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Cadastro realizado com sucesso! Redirecionando...');
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        showError(data.error || 'Erro no cadastro');
      }
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro ao conectar com o servidor');
    }
  });

  function showError(message) {
    alertError.textContent = message;
    alertError.style.display = 'block';
  }

  function showSuccess(message) {
    alertSuccess.textContent = message;
    alertSuccess.style.display = 'block';
  }
});