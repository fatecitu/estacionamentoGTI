export default {
  base: '/estacionamento/',
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        menu: 'menu.html',
        modelos: 'modelos.html',
        novo: 'novo.html',
        veiculos: 'veiculos.html',
      },
    },
  },
};
