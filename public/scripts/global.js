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