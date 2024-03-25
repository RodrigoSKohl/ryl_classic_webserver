```.
└── root/
    ├── certificate
    ├── middlewares
    ├── models
    ├── public/
    │   ├── images
    │   ├── scripts
    │   └── styles
    ├── routes
    └── views

criar inicializacao com o nodemon
pm2 start --name="site" --interpreter=npx --watch app.js
deletar qualquer processo antes de executar
depois dar um pm2 save

arquivo de conf do nginx não esta configurado com senha