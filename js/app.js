(function() {
  var firebaseConfigurado = (typeof firebase !== 'undefined' && FIREBASE_CONFIG.apiKey !== "SUA_API_KEY");

  if (firebaseConfigurado) {
    try {
      firebase.initializeApp(FIREBASE_CONFIG);
      // Login automatico anonimo (sem interacao do usuario)
      initAuth(function(user) {
        if (user) {
          db.usandoFirestore = true;
          db.usuarioId = user.uid;
          carregarDados();
        } else {
          db.usandoFirestore = false;
          carregarLocal();
          carregarDados();
        }
        irPara('menu');
      });
    } catch(e) {
      console.warn('Erro Firebase:', e);
      fallbackLocal();
    }
  } else {
    fallbackLocal();
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function(){});
  }

  function fallbackLocal() {
    db.usandoFirestore = false;
    carregarLocal();
    carregarDados();
    irPara('menu');
  }
})();
