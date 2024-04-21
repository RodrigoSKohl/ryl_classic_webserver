document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav');

  // Event listener para abrir/fechar o menu
  menuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      nav.classList.toggle('active');
  });

  // Event listener para fechar o menu se clicar fora
  document.body.addEventListener('click', function(event) {
      if (nav.classList.contains('active') && !event.target.closest('#menu-toggle')) {
          nav.classList.remove('active');
          menuToggle.classList.remove('active');
      }
  });
});

//Evento scroll solido do navbar
window.addEventListener('scroll', function() {
    var header = document.querySelector('header'); // Seleciona o header
    var navbar = document.querySelector('.navbar'); // Seleciona o navbar
    var scrolled = window.scrollY;
  
    // Se o usuário fez scroll, torna o navbar sólido, caso contrário, torna transparente
    if (scrolled > 0) {
        header.style.backgroundColor = '#333'; // Define a cor de fundo do navbar
        navbar.style.borderBottom = "none"; // Aqui está a correção
    } else {
        header.style.backgroundColor = 'transparent'; // Torna o navbar transparente
        navbar.style.borderBottom = "2px ridge #cccccc3f";
    }
    header.style.transition = "background-color 0.3s ease"; // Adiciona uma transição suave
  });

//MOSTRAR FOOTER SOMENTE QUANDO O USUÁRIO CHEGAR AO FINAL DA PÁGINA
  document.addEventListener('DOMContentLoaded', function() {
    var footer = document.querySelector('footer');
    var showFooterThreshold = 0.95; // Exibir o footer quando o usuário rolar até 95% do final da página

    function toggleFooter() {
        // Calcular a posição em que o usuário está em relação ao final da página
        var positionRelativeToBottom = (window.innerHeight + window.scrollY) / document.documentElement.scrollHeight;

        // Se a posição for maior ou igual ao limite definido, exibir o footer
        if (positionRelativeToBottom >= showFooterThreshold) {
            footer.style.display = 'block'; // Exibe o footer
            localStorage.setItem('footerVisible', 'true'); // Armazena o estado do footer como visível
        } else {
            footer.style.display = 'none'; // Oculta o footer
            localStorage.setItem('footerVisible', 'false'); // Armazena o estado do footer como oculto
        }
    }

    // Verifica se o footer estava visível antes
    var footerWasVisible = localStorage.getItem('footerVisible');
    if (footerWasVisible === 'true') {
        footer.style.display = 'block'; // Exibe o footer
    } else {
        footer.style.display = 'none'; // Oculta o footer
    }

    // Chama a função para verificar o estado do footer ao carregar a página
    toggleFooter();

    // Adiciona um listener de evento de rolagem
    window.addEventListener('scroll', toggleFooter);
});