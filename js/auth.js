var currentUser = null;

function initAuth(callback) {
  if (!firebase.apps.length) { if (callback) callback(null); return; }
  firebase.auth().signInAnonymously().then(function(result) {
    currentUser = result.user;
    document.documentElement.setAttribute('data-user', currentUser.uid);
    if (callback) callback(currentUser);
  }).catch(function(err) {
    console.warn('Auth anonima falhou:', err);
    if (callback) callback(null);
  });
}

function estaLogado() {
  return currentUser !== null;
}
