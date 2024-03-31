module.exports = {
    apps: [
      {
        name: 'site',
        script: 'app.js',
        interpreter: 'npx',
        instances: '1', // Você pode definir o número de instâncias conforme necessário
        autorestart: true,
        watch: true,
        max_memory_restart: '1G',
      }
    ]
  };