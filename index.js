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

      const formData = new FormData(this);

      try {
        // Obter o token do hCaptcha apenas se o formulário não tiver erros
        if (this.checkValidity()) {
          const hcaptchaToken = window.hcaptcha.getResponse();
          formData.append('hcaptchaToken', hcaptchaToken);
        }

        const response = await fetch('http://191.220.202.47:5000/registrar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(Object.fromEntries(formData)),
        });

        if (response.ok) {
  const successMessage = await response.text(); // Obtém o conteúdo da resposta
  alert(`${successMessage}`);
  location.reload(); // Recarrega a página
} else {
  const errorText = await response.text();
  alert(`Erro ao registrar usuário: ${errorText}`);
}
      } catch (error) {
        console.error('Erro ao enviar solicitação:', error.message);
        alert('Erro interno do cliente.');
        window.hcaptcha.reset(); // Resetar o hCaptcha em caso de erro
      }
    });
