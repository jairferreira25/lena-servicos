function toast(msg, tipo) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = tipo === 'erro' ? '#FF6B6B' : tipo === 'aviso' ? '#FFA500' : '#444';
  t.className = 'toast show';
  clearTimeout(t._hide);
  t._hide = setTimeout(function(){ t.className = 'toast'; }, 2800);
}

function modal(titulo, msg, callback) {
  document.getElementById('modalContent').innerHTML =
    '<h3>' + titulo + '</h3><p>' + msg + '</p><div class="btns">' +
    '<button class="btn btn-sm" onclick="fecharModal()">Cancelar</button>' +
    '<button class="btn btn-sm btn-danger" id="modalConfirm">Confirmar</button></div>';
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('modalConfirm').onclick = function(){ fecharModal(); if (callback) callback(); };
}

function fecharModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

var appState = {
  screen: 'menu',
  relDados: null,
  funcs: [],
  turnosListener: null,
  funcsListener: null
};

function irPara(screen) {
  appState.screen = screen;
  renderizar();
}

function carregarDados() {
  // Escuta funcionarios em tempo real
  if (appState.funcsListener && typeof appState.funcsListener === 'function') appState.funcsListener();
  appState.funcsListener = listarFuncionarios(function(lista) {
    appState.funcs = lista;
    if (appState.screen === 'menu' || appState.screen === 'registrar' || appState.screen === 'editar' || appState.screen === 'relatorio') {
      renderizar();
    }
  });
}

function dataHoje() {
  return new Date().toISOString().split('T')[0];
}

function primeiroDiaMes() {
  var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}

function formatarDataISO(data) {
  if (!data) return '';
  var partes = data.split('-');
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}
