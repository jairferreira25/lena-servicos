(function() {
  initDB(function() {
    carregarDados();
    irPara('menu');
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function() {});
  }
})();
