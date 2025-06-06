document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        senha: formData.get('senha'),
      }),
    });

    if (res.ok) {
      window.location.href = '/dashboard.html';
    } else {
      alert(await res.text());
    }
  });
});
