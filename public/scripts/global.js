document.addEventListener('DOMContentLoaded', function() {
    var topPanel = document.querySelector('.topPanel');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 0) {
            topPanel.classList.remove('transparent');
            topPanel.classList.add('black');
        } else {
            topPanel.classList.remove('black');
            topPanel.classList.add('transparent');
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    var links = document.querySelectorAll('.nav li a');
    var currentUrl = window.location.pathname; // Obtém o caminho da URL atual

    links.forEach(function(link) {
        // Remove a classe ativa de todos os links
        link.classList.remove('active');
        
        // Se o href do link corresponder ao caminho atual ou à raiz "/", adiciona a classe ativa
        if (link.getAttribute('href') === currentUrl || (link.getAttribute('href') === '/' && currentUrl === '/homepage')) {
            link.classList.add('active');
        }
    });
});