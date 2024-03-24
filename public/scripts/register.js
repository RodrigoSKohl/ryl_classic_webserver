document.getElementById('registroForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const messageContainer = document.getElementById('message-container');
    const submitButton = document.getElementById('submitButton');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const formData = new FormData(this);

    // Ocultar o botão de envio e mostrar o spinner de carregamento
    submitButton.style.display = 'none';
    loadingSpinner.style.display = 'inline-block';

    await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    })
    .then(response => response.json())
    .then(data => {
        // Ocultar o spinner de carregamento
        loadingSpinner.style.display = 'none';

        if (data.success) {
            document.getElementById('registroForm').reset();
            messageContainer.innerHTML = `<p class="success">${data.success}</p>`;
            window.hcaptcha.reset(); 
            showSuccessModal(); // Mostrar o modal de sucesso
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
            showErrorModal(); // Mostrar o modal de erro
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        messageContainer.innerHTML = '<p class="error">Erro interno do servidor.</p>';
        showErrorModal(); // Mostrar o modal de erro
    })
    .finally(() => {
        // Mostrar novamente o botão de envio
        submitButton.style.display = 'inline-block';
    });
});

// Função para mostrar o modal de sucesso
function showSuccessModal() {
    var successModal = document.getElementById("successModal");
    successModal.style.display = "block";
}

// Função para mostrar o modal de erro
function showErrorModal() {
    var errorModal = document.getElementById("successModal");
    errorModal.style.display = "block";
}

// Evento de clique para fechar o modal
document.querySelectorAll('.close').forEach(function(closeButton) {
    closeButton.addEventListener('click', function() {
        this.parentElement.parentElement.style.display = "none";
    });
});
