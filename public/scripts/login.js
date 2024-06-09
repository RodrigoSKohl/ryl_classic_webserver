
  document.addEventListener('DOMContentLoaded', function() {
    function showSuccessModal() {
        var successModal = document.getElementById("Modal");
        var backgroundModal = document.getElementById("modalBackgroud"); // Defina a variável aqui
        if (successModal && backgroundModal) {
            successModal.style.display = "block";
            backgroundModal.style.display = "block";
            // Definir um atributo para indicar sucesso no modal
            successModal.setAttribute('data-success', 'true');
        }
    }
    
    // Função para mostrar o modal de erro
    function showErrorModal() {
        var errorModal = document.getElementById("Modal");
        var backgroundModal = document.getElementById("modalBackgroud"); // Defina a variável aqui também
        if (errorModal && backgroundModal) {
            errorModal.style.display = "block";
            backgroundModal.style.display = "block";
            // Remover o atributo de sucesso no modal de erro
            errorModal.removeAttribute('data-success');
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
                
                // Verificar se o modal está marcado como sucesso
                const dataSuccess = parentModal.getAttribute('data-success');
                if (dataSuccess === 'true') {
                    // Se for sucesso, verificar se há redirecionamento
                    const dataRedirect = parentModal.getAttribute('data-redirect');
                    if (dataRedirect) {
                        window.location.href = dataRedirect;
                    }
                }
            }
        });
    });

    // Event listener para o formulário de login
    var loginForm = document.querySelector('.loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const messageContainer = document.getElementById('message-container');
            const loadingSpinner = document.getElementById('loadingSpinner');
            const formData = new FormData(this);
            var backgroundModal = document.getElementById("modalBackgroud"); // Defina a variável aqui

            // mostrar o spinner de carregamento
            if (loadingSpinner) {
                loadingSpinner.style.display = 'block';
                backgroundModal.style.display = "block";
            }




            
            var formID = loginForm.id;
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
                    backgroundModal.style.display = "none";
                }
            
                if (data.success) {
                    if (loginForm) {
                        loginForm.reset();
                    }
                    if (messageContainer) {
                        messageContainer.innerHTML = `<p class="success">${data.success}</p>`;
                    }
                    window.hcaptcha.reset(); 
                    showSuccessModal(); // Mostrar o modal de sucesso
                    // Definir o redirecionamento no modal de sucesso, se houver
                    const redirectURL = data.redirect;

                                // Obter o token e salvar ele
            const { token } = await response.json();
            // Armazenar o token no localStorage
            localStorage.setItem('token', token);
                    if (redirectURL) {
                        const successModal = document.getElementById("Modal");
                        successModal.setAttribute('data-redirect', redirectURL);
                    }
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
                // mesmo que tenha ocorrido erro ocultar o spinner de carregamento
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }
            });
        });
    }
});