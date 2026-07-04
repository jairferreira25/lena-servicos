var db = {
  usandoGitHub: true,
  local: { funcionarios: [], turnos: [], config: { valor_manha: 120, valor_noite: 100 } }
};

function initDB(callback) {
  db.usandoGitHub = true;
  gitInitDB(function(sucesso) {
    if (!sucesso) {
      db.usandoGitHub = false;
      carregarLocal();
    }
    if (callback) callback();
  });
}

function carregarLocal() {
  try { var raw = localStorage.getItem('lena_db'); if (raw) db.local = JSON.parse(raw); } catch (e) {}
}

function salvarLocal() {
  localStorage.setItem('lena_db', JSON.stringify(db.local));
}

function listarFuncionarios(callback) {
  if (db.usandoGitHub) gitListarFuncionarios(callback);
  else callback(db.local.funcionarios);
}

function adicionarFuncionario(nome, callback) {
  if (db.usandoGitHub) gitAdicionarFuncionario(nome, callback);
  else {
    if (db.local.funcionarios.some(function(f) { return f.nome.toLowerCase() === nome.toLowerCase(); })) {
      callback('Funcionario ja existe'); return;
    }
    db.local.funcionarios.push({ id: Date.now() + '', nome: nome });
    salvarLocal(); callback(null);
  }
}

function excluirFuncionario(nome, callback) {
  if (db.usandoGitHub) gitExcluirFuncionario(nome, callback);
  else {
    var f = db.local.funcionarios.find(function(x) { return x.nome === nome; });
    if (f) db.local.turnos = db.local.turnos.filter(function(t) { return t.funcionario_id !== f.id; });
    db.local.funcionarios = db.local.funcionarios.filter(function(x) { return x.nome !== nome; });
    salvarLocal(); callback(null);
  }
}

function listarTurnos(filtros, callback) {
  if (db.usandoGitHub) gitListarTurnos(filtros, callback);
  else {
    var lista = db.local.turnos.slice().sort(function(a, b) { return b.data.localeCompare(a.data); });
    if (filtros.funcionario_id) lista = lista.filter(function(t) { return t.funcionario_id === filtros.funcionario_id; });
    if (filtros.funcionario_nome) lista = lista.filter(function(t) { return t.funcionario_nome === filtros.funcionario_nome; });
    if (filtros.inicio) lista = lista.filter(function(t) { return t.data >= filtros.inicio; });
    if (filtros.fim) lista = lista.filter(function(t) { return t.data <= filtros.fim; });
    callback(lista);
  }
}

function adicionarTurno(turno, callback) {
  if (db.usandoGitHub) gitAdicionarTurno(turno, callback);
  else {
    turno.id = Date.now() + '';
    db.local.turnos.push(turno);
    salvarLocal(); callback(null);
  }
}

function atualizarTurno(id, dados, callback) {
  if (db.usandoGitHub) gitAtualizarTurno(id, dados, callback);
  else {
    var idx = db.local.turnos.findIndex(function(t) { return t.id === id; });
    if (idx >= 0) Object.assign(db.local.turnos[idx], dados);
    salvarLocal(); callback(null);
  }
}

function excluirTurno(id, callback) {
  if (db.usandoGitHub) gitExcluirTurno(id, callback);
  else {
    db.local.turnos = db.local.turnos.filter(function(t) { return t.id !== id; });
    salvarLocal(); if (callback) callback(null);
  }
}

function obterConfig(chave, padrao) {
  if (db.usandoGitHub) return gitObterConfig(chave, padrao);
  return db.local.config[chave] !== undefined ? db.local.config[chave] : padrao;
}

function salvarConfig(chave, valor, callback) {
  if (db.usandoGitHub) gitSalvarConfig(chave, valor, callback);
  else {
    db.local.config[chave] = valor;
    salvarLocal(); if (callback) callback(null);
  }
}
