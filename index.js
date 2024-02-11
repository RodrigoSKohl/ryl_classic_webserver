document.addEventListener('DOMContentLoaded', async function () {
  try {
    const csrfResponse = await fetch('http://192.168.94.110:3000/get-csrf-token');
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;

    // Definir o valor do campo oculto com o token CSRF
    const csrfTokenInput = document.getElementById('csrfToken');
    csrfTokenInput.value = csrfToken;
    console.log('CSRF Token do Frontend:', csrfToken);
    
  } catch (error) {
    console.error('Erro ao obter o token CSRF:', error.message);
  }
});

const senhaInput = document.getElementById('senha');
const confirmarSenhaInput = document.getElementById('confirmarSenha');
const senhaError = document.getElementById('senhaError');

document.getElementById('registroForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  // Bloquear cópia/colagem nos campos de senha
  senhaInput.addEventListener('copy', (event) => {
    event.preventDefault();
  });

  senhaInput.addEventListener('paste', (event) => {
    event.preventDefault();
  });

  confirmarSenhaInput.addEventListener('copy', (event) => {
    event.preventDefault();
  });

  confirmarSenhaInput.addEventListener('paste', (event) => {
    event.preventDefault();
  });

  try {
    // Obter o token do hCaptcha apenas se o formulário não tiver erros
    if (this.checkValidity()) {
      const hcaptchaToken = window.hcaptcha.getResponse();

      // Agora você pode adicionar o token CSRF e o token hCaptcha ao formData
      const formData = new FormData(this);
      formData.append('hcaptchaToken', hcaptchaToken);
      console.log(Object.fromEntries(formData));
      const response = await fetch('http://192.168.94.110:3000/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      if (response.ok) {
        const successMessage = await response.text();
        alert(`${successMessage}`);
        location.reload();
      } else {
        const errorText = await response.text();
        alert(`Erro ao registrar usuário: ${errorText}`);
      }
    }
  } catch (error) {
    console.error('Erro ao enviar solicitação:', error.message);
    alert('Erro interno do cliente.');
    window.hcaptcha.reset();
  }
});