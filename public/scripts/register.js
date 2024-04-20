document.addEventListener('DOMContentLoaded', function() {
    function showSuccessModal() {
        var successModal = document.getElementById("Modal");
        var backgroundModal = document.getElementById("modalBackgroud"); // Defina a variável aqui
        if (successModal && backgroundModal) {
            successModal.style.display = "block";
            backgroundModal.style.display = "block";
        }
    }
    
    // Função para mostrar o modal de erro
    function showErrorModal() {
        var errorModal = document.getElementById("Modal");
        var backgroundModal = document.getElementById("modalBackgroud"); // Defina a variável aqui também
        if (errorModal && backgroundModal) {
            errorModal.style.display = "block";
            backgroundModal.style.display = "block";
        }
    }
    
    // Evento de clique para fechar o modal
    document.querySelectorAll('.close').forEach(function(closeButton) {
        closeButton.addEventListener('click', function() {
            var parentModal = this.closest('.modal');
            var modalBackground = document.querySelector('.modal-background');
    
            // Verifica se o modal e o fundo do modal foram encontrados
            if (parentModal && modalBackground) {
                parentModal.style.display = "none";
                modalBackground.style.display = "none";
            }
        });
    });

    // Event listener para o formulário de registro
    var registroForm = document.querySelector('.registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const messageContainer = document.getElementById('message-container');
            const submitButton = document.getElementById('submitButton');
            const loadingSpinner = document.getElementById('loadingSpinner');
            const formData = new FormData(this);

            // Ocultar o botão de envio e mostrar o spinner de carregamento
            if (submitButton) {
                submitButton.style.display = 'none';
            }
            if (loadingSpinner) {
                loadingSpinner.style.display = 'inline-block';
            }
            var formID = registroForm.id;
            var apiRoute = `/api/${formID}`;

            await fetch(apiRoute, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData)),
            })
            .then(response => response.json())
            .then(data => {
                // Ocultar o spinner de carregamento
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }

                if (data.success) {
                    if (registroForm) {
                        registroForm.reset();
                    }
                    if (messageContainer) {
                        messageContainer.innerHTML = `<p class="success">${data.success}</p>`;
                    }
                    window.hcaptcha.reset(); 
                    showSuccessModal(); // Mostrar o modal de sucesso
                } else if (data.error || (data.errors && data.errors.length > 0)) {
                    if (messageContainer) {
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
                    showErrorModal(); // Mostrar o modal de erro
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                if (messageContainer) {
                    messageContainer.innerHTML = '<p class="error">Internal Server Error</p>';
                }
                showErrorModal(); // Mostrar o modal de erro
            })
            .finally(() => {
                // Mostrar novamente o botão de envio
                if (submitButton) {
                    submitButton.style.display = 'inline-block';
                }
            });
        });
    }
});

