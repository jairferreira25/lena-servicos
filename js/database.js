var db = {
  local: { funcionarios: [], turnos: [], config: { valor_manha: 120, valor_noite: 100 } },
  firestore: null,
  usuarioId: null,
  usandoFirestore: false,
  listeners: []
};

function initDB() {
  if (firebase.apps.length && FIREBASE_CONFIG.apiKey !== "SUA_API_KEY") {
    db.firestore = firebase.firestore();
    db.usandoFirestore = true;
    db.usuarioId = null;
    initAuth();
    return true;
  }
  db.usandoFirestore = false;
  carregarLocal();
  return false;
}

// ===== LOCAL STORAGE =====
function carregarLocal() {
  try {
    var raw = localStorage.getItem('lena_db');
    if (raw) db.local = JSON.parse(raw);
  } catch(e) {}
}

function salvarLocal() {
  localStorage.setItem('lena_db', JSON.stringify(db.local));
}

// ===== FIRESTORE CRUD =====
function getRef(colecao) {
  if (db.usandoFirestore && currentUser) {
    return db.firestore.collection('empresas').doc(currentUser.uid).collection(colecao);
  }
  return null;
}

// Funcionarios
function listarFuncionarios(callback) {
  if (db.usandoFirestore && currentUser) {
    return getRef('funcionarios').orderBy('nome').onSnapshot(function(snap) {
      var lista = [];
      snap.forEach(function(doc) { lista.push({ id: doc.id, nome: doc.data().nome }); });
      callback(lista);
    }, function() { callback(db.local.funcionarios); });
  }
  callback(db.local.funcionarios);
  return null;
}

function adicionarFuncionario(nome, callback) {
  if (db.usandoFirestore && currentUser) {
    getRef('funcionarios').add({ nome: nome })
      .then(function() { callback(null); })
      .catch(function(err) { callback(err); });
  } else {
    if (db.local.funcionarios.some(function(f){ return f.nome.toLowerCase() === nome.toLowerCase(); })) {
      callback('Funcionario ja existe');
      return;
    }
    db.local.funcionarios.push({ id: Date.now() + '', nome: nome });
    salvarLocal();
    callback(null);
  }
}

function excluirFuncionario(nome, callback) {
  if (db.usandoFirestore && currentUser) {
    var funcRef = getRef('funcionarios');
    funcRef.where('nome', '==', nome).get().then(function(snap) {
      snap.forEach(function(doc) {
        doc.ref.delete();
        getRef('turnos').where('funcionario_id', '==', doc.id).get().then(function(snap2) {
          snap2.forEach(function(d) { d.ref.delete(); });
        });
      });
      callback(null);
    }).catch(function(err) { callback(err); });
  } else {
    db.local.turnos = db.local.turnos.filter(function(t){
      var f = db.local.funcionarios.find(function(x){ return x.nome === nome; });
      return f ? t.funcionario_id !== f.id : true;
    });
    db.local.funcionarios = db.local.funcionarios.filter(function(f){ return f.nome !== nome; });
    salvarLocal();
    callback(null);
  }
}

// Turnos
function listarTurnos(filtros, callback) {
  if (db.usandoFirestore && currentUser) {
    var ref = getRef('turnos');
    var query = ref.orderBy('data', 'desc');
    if (filtros.funcionario_id) query = query.where('funcionario_id', '==', filtros.funcionario_id);
    return query.onSnapshot(function(snap) {
      var lista = [];
      snap.forEach(function(doc) {
        var d = doc.data(); d.id = doc.id; lista.push(d);
      });
      // Filtros adicionais
      if (filtros.inicio) lista = lista.filter(function(t){ return t.data >= filtros.inicio; });
      if (filtros.fim) lista = lista.filter(function(t){ return t.data <= filtros.fim; });
      if (filtros.funcionario_nome) lista = lista.filter(function(t){ return t.funcionario_nome === filtros.funcionario_nome; });
      callback(lista);
    }, function() { callback([]); });
  }
  var lista = db.local.turnos.slice().sort(function(a,b){ return b.data.localeCompare(a.data); });
  if (filtros.funcionario_id) lista = lista.filter(function(t){ return t.funcionario_id === filtros.funcionario_id; });
  if (filtros.funcionario_nome) lista = lista.filter(function(t){ return t.funcionario_nome === filtros.funcionario_nome; });
  if (filtros.inicio) lista = lista.filter(function(t){ return t.data >= filtros.inicio; });
  if (filtros.fim) lista = lista.filter(function(t){ return t.data <= filtros.fim; });
  callback(lista);
  return null;
}

function adicionarTurno(turno, callback) {
  if (db.usandoFirestore && currentUser) {
    getRef('turnos').add(turno)
      .then(function() { callback(null); })
      .catch(function(err) { callback(err); });
  } else {
    turno.id = Date.now() + '';
    db.local.turnos.push(turno);
    salvarLocal();
    callback(null);
  }
}

function atualizarTurno(id, dados, callback) {
  if (db.usandoFirestore && currentUser) {
    getRef('turnos').doc(id).update(dados)
      .then(function() { callback(null); })
      .catch(function(err) { callback(err); });
  } else {
    var idx = db.local.turnos.findIndex(function(t){ return t.id === id; });
    if (idx >= 0) { Object.assign(db.local.turnos[idx], dados); salvarLocal(); }
    callback(null);
  }
}

function excluirTurno(id, callback) {
  if (db.usandoFirestore && currentUser) {
    getRef('turnos').doc(id).delete()
      .then(function() { if (callback) callback(null); })
      .catch(function(err) { if (callback) callback(err); });
  } else {
    db.local.turnos = db.local.turnos.filter(function(t){ return t.id !== id; });
    salvarLocal();
    if (callback) callback(null);
  }
}

// Config
function obterConfig(chave, padrao) {
  if (db.usandoFirestore && currentUser) {
    // Busca do Firestore - assincrono
    return padrao;
  }
  return db.local.config[chave] !== undefined ? db.local.config[chave] : padrao;
}

function salvarConfig(chave, valor, callback) {
  if (db.usandoFirestore && currentUser) {
    getRef('config').doc(chave).set({ valor: valor })
      .then(function(){ if(callback) callback(null); })
      .catch(function(err){ if(callback) callback(err); });
  } else {
    db.local.config[chave] = valor;
    salvarLocal();
    if (callback) callback(null);
  }
}
