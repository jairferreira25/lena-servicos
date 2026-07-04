var GITHUB_DB = {
  repo: 'jairferreira25/lena-servicos',
  branch: 'master',
  path: 'data/db.json',
  rawBase: 'https://raw.githubusercontent.com',
  apiBase: 'https://api.github.com/repos',
  dados: { funcionarios: [], turnos: [], config: { valor_manha: 120, valor_noite: 100 } },
  listeners: [],
  pollTimer: null,
  ultimaSHA: null
};

function gitToken() {
  var t = localStorage.getItem('github_token');
  if (!t) t = '';
  return t;
}

function gitInitDB() {
  var tok = gitToken();
  if (!tok) {
    var t = prompt('Cole o token do GitHub para ativar o sync:\n(ghp_...)');
    if (t && t.length > 10) {
      localStorage.setItem('github_token', t);
    } else {
      db.usandoGitHub = false;
      carregarLocal();
      return;
    }
  }
  gitCarregar(function() {
    gitNotificar();
    if (GITHUB_DB.pollTimer) clearInterval(GITHUB_DB.pollTimer);
    GITHUB_DB.pollTimer = setInterval(gitPoll, 5000);
  });
}

function gitCarregar(callback) {
  var url = GITHUB_DB.rawBase + '/' + GITHUB_DB.repo + '/' + GITHUB_DB.branch + '/' + GITHUB_DB.path;
  fetch(url).then(function(r) {
    if (!r.ok) throw new Error('Status ' + r.status);
    return r.text();
  }).then(function(text) {
    try { GITHUB_DB.dados = JSON.parse(text); } catch(e) {}
    gitObterSHA(function() { if (callback) callback(); });
  }).catch(function() {
    gitCriarArquivo(function() { if (callback) callback(); });
  });
}

function gitObterSHA(callback) {
  fetch(GITHUB_DB.apiBase + '/' + GITHUB_DB.repo + '/contents/' + GITHUB_DB.path, {
    headers: { 'Authorization': 'token ' + gitToken(), 'Accept': 'application/vnd.github.v3+json' }
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.sha) GITHUB_DB.ultimaSHA = data.sha;
    if (callback) callback();
  }).catch(function() { if (callback) callback(); });
}

function gitCriarArquivo(callback) {
  var tok = gitToken();
  if (!tok) { if (callback) callback(); return; }
  var conteudo = btoa(unescape(encodeURIComponent(JSON.stringify(GITHUB_DB.dados, null, 2))));
  fetch(GITHUB_DB.apiBase + '/' + GITHUB_DB.repo + '/contents/' + GITHUB_DB.path, {
    method: 'PUT',
    headers: { 'Authorization': 'token ' + tok, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'init db', content: conteudo, branch: GITHUB_DB.branch })
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.content) GITHUB_DB.ultimaSHA = data.content.sha;
    if (callback) callback();
  }).catch(function() { if (callback) callback(); });
}

function gitSalvar(callback) {
  var tok = gitToken();
  if (!tok) { db.usandoGitHub = false; if (callback) callback('Sem token'); return; }
  var conteudo = btoa(unescape(encodeURIComponent(JSON.stringify(GITHUB_DB.dados, null, 2))));
  fetch(GITHUB_DB.apiBase + '/' + GITHUB_DB.repo + '/contents/' + GITHUB_DB.path, {
    method: 'PUT',
    headers: { 'Authorization': 'token ' + tok, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'sync data',
      content: conteudo,
      branch: GITHUB_DB.branch,
      sha: GITHUB_DB.ultimaSHA
    })
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.content) GITHUB_DB.ultimaSHA = data.content.sha;
    GITHUB_DB.dados = JSON.parse(decodeURIComponent(escape(atob(conteudo))));
    gitNotificar();
    if (callback) callback(null);
  }).catch(function(err) {
    if (callback) callback('Erro ao salvar');
  });
}

function gitPoll() {
  var tok = gitToken();
  if (!tok) return;
  fetch(GITHUB_DB.apiBase + '/' + GITHUB_DB.repo + '/contents/' + GITHUB_DB.path, {
    headers: { 'Authorization': 'token ' + tok, 'Accept': 'application/vnd.github.v3+json' }
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.sha && data.sha !== GITHUB_DB.ultimaSHA) {
      GITHUB_DB.ultimaSHA = data.sha;
      var json = atob(data.content.replace(/\n/g, ''));
      GITHUB_DB.dados = JSON.parse(json);
      gitNotificar();
    }
  }).catch(function() {});
}

function gitNotificar() {
  for (var i = 0; i < GITHUB_DB.listeners.length; i++) {
    try { GITHUB_DB.listeners[i](); } catch (e) {}
  }
}

function gitOnChange(callback) {
  GITHUB_DB.listeners.push(callback);
}

function gitListarFuncionarios(callback) {
  callback(GITHUB_DB.dados.funcionarios);
}

function gitAdicionarFuncionario(nome, callback) {
  if (GITHUB_DB.dados.funcionarios.some(function(f) { return f.nome.toLowerCase() === nome.toLowerCase(); })) {
    callback('Funcionario ja existe');
    return;
  }
  GITHUB_DB.dados.funcionarios.push({ id: Date.now() + '_' + Math.random().toString(36).slice(2, 6), nome: nome });
  gitSalvar(callback);
}

function gitExcluirFuncionario(nome, callback) {
  var func = GITHUB_DB.dados.funcionarios.find(function(f) { return f.nome === nome; });
  if (func) GITHUB_DB.dados.turnos = GITHUB_DB.dados.turnos.filter(function(t) { return t.funcionario_id !== func.id; });
  GITHUB_DB.dados.funcionarios = GITHUB_DB.dados.funcionarios.filter(function(f) { return f.nome !== nome; });
  gitSalvar(callback);
}

function gitListarTurnos(filtros, callback) {
  var lista = GITHUB_DB.dados.turnos.slice().sort(function(a, b) { return b.data.localeCompare(a.data); });
  if (filtros.funcionario_id) lista = lista.filter(function(t) { return t.funcionario_id === filtros.funcionario_id; });
  if (filtros.funcionario_nome) lista = lista.filter(function(t) { return t.funcionario_nome === filtros.funcionario_nome; });
  if (filtros.inicio) lista = lista.filter(function(t) { return t.data >= filtros.inicio; });
  if (filtros.fim) lista = lista.filter(function(t) { return t.data <= filtros.fim; });
  callback(lista);
}

function gitAdicionarTurno(turno, callback) {
  turno.id = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  GITHUB_DB.dados.turnos.push(turno);
  gitSalvar(callback);
}

function gitAtualizarTurno(id, dados, callback) {
  var idx = GITHUB_DB.dados.turnos.findIndex(function(t) { return t.id === id; });
  if (idx >= 0) Object.assign(GITHUB_DB.dados.turnos[idx], dados);
  gitSalvar(callback);
}

function gitExcluirTurno(id, callback) {
  GITHUB_DB.dados.turnos = GITHUB_DB.dados.turnos.filter(function(t) { return t.id !== id; });
  gitSalvar(callback);
}

function gitObterConfig(chave, padrao) {
  return GITHUB_DB.dados.config[chave] !== undefined ? GITHUB_DB.dados.config[chave] : padrao;
}

function gitSalvarConfig(chave, valor, callback) {
  GITHUB_DB.dados.config[chave] = valor;
  gitSalvar(callback);
}
