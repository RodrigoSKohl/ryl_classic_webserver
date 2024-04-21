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


  document.addEventListener('DOMContentLoaded', function() {
    var footer = document.querySelector('footer');

    function toggleFooter() {
        // Se a posição do scroll estiver no final da página, exiba o footer
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight) {
            footer.style.display = 'block'; // Exibe o footer
        } else {
            footer.style.display = 'none'; // Oculta o footer
        }
    }

    // Adiciona um listener de evento de rolagem
    window.addEventListener('scroll', toggleFooter);

    // Chama a função para verificar o estado do footer ao carregar a página
    toggleFooter();
});