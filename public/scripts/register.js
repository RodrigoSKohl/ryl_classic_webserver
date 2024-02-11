document.getElementById('registroForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const messageContainer = document.getElementById('message-container');
    const formData = new FormData(this);

    await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),


    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('registroForm').reset();
            messageContainer.innerHTML = `<p class="success">${data.success}</p>`;
            window.hcaptcha.reset(); 
        } else if (data.error || (data.errors && data.errors.length > 0)) {
            messageContainer.innerHTML = '';
            
            if (data.error) {
                messageContainer.innerHTML += `<p class="error">${data.error}</p>`;
            }
        
            // Exibir cada mensagem de erro
            if (data.errors) {
                data.errors.forEach(error => {
                    messageContainer.innerHTML += `<p class="error">${error}</p>`;
                });
            }
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        messageContainer.innerHTML = '<p class="error">Erro interno do servidor.</p>';
    });
});

