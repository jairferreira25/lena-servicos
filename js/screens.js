function renderizar() {
  var html = '';
  switch (appState.screen) {
    case 'menu': html = telaMenu(); break;
    case 'cadastrar': html = telaCadastrar(); break;
    case 'registrar': html = telaRegistrar(); break;
    case 'relatorio': html = telaRelatorio(); break;
    case 'editar': html = telaEditar(); break;
    case 'config': html = telaConfig(); break;
    case 'dashboard': html = telaDashboard(); break;
    default: html = telaMenu();
  }
  document.getElementById('app').innerHTML = html;
  posRenderizar();
}

function posRenderizar() {
  if (appState.screen === 'relatorio' && appState.relDados) exibirResultado(appState.relDados);
  if (appState.screen === 'editar') {
    carregarTurnosEdicao();
  }
  if (appState.screen === 'dashboard') initDashboard();
}

function telaMenu() {
  return '<h1>LENA SERVICOS</h1>' +
    '<p class="sub">Selecione uma opcao</p>' +
    '<div style="display:flex;gap:8px;justify-content:center;margin:4px 0;flex-wrap:wrap">' +
    '<button class="btn btn-sm" onclick="irPara(\'dashboard\')">📊 Dashboard</button>' +
    '<button class="btn btn-sm" onclick="irPara(\'config\')">⚙️ Precos</button>' +
    '</div>' +
    '<div class="grid-menu">' +
    '<div class="card" onclick="irPara(\'cadastrar\')"><span class="icon">👥</span><div class="label">Cadastrar</div><div class="sublabel">Funcionario</div></div>' +
    '<div class="card" onclick="irPara(\'registrar\')"><span class="icon">📝</span><div class="label">Registrar</div><div class="sublabel">Dia</div></div>' +
    '<div class="card" onclick="irPara(\'relatorio\')"><span class="icon">📊</span><div class="label">Gerar</div><div class="sublabel">Relatorio</div></div>' +
    '<div class="card" onclick="irPara(\'editar\')"><span class="icon">🗑️</span><div class="label">Excluir</div><div class="sublabel">Registro</div></div>' +
    '</div>';
}

function telaCadastrar() {
  return '<button class="btn-home" onclick="irPara(\'menu\')">Voltar ao Inicio</button>' +
    '<form onsubmit="event.preventDefault();acaoCadastrar()">' +
    '<h2>👥 Cadastrar Funcionario</h2>' +
    '<label class="label">Nome completo</label>' +
    '<input type="text" id="inputNome" placeholder="Nome do funcionario" required autofocus>' +
    '<button class="btn btn-primary" type="submit">Salvar Cadastro</button>' +
    '</form>';
}

function telaRegistrar() {
  var opts = appState.funcs.length ? appState.funcs.map(function(f){ return '<option value="' + f.nome + '">' + f.nome + '</option>'; }).join('') : '<option value="">Nenhum cadastrado</option>';
  var vm = obterConfig('valor_manha', 120);
  var vn = obterConfig('valor_noite', 100);
  return '<button class="btn-home" onclick="irPara(\'menu\')">Voltar ao Inicio</button>' +
    '<form onsubmit="event.preventDefault();acaoRegistrar()">' +
    '<h2>📝 Registrar Turno</h2>' +
    '<label class="label">Funcionario</label>' +
    '<select id="selectFuncReg">' + opts + '</select>' +
    '<label class="label">Turno</label>' +
    '<select id="selectTurno"><option value="manha">Manha (R$ ' + vm.toFixed(2) + ')</option><option value="noite">Noite (R$ ' + vn.toFixed(2) + ')</option></select>' +
    '<label class="label">Data</label>' +
    '<input type="date" id="inputDataReg" value="' + dataHoje() + '">' +
    '<button class="btn btn-primary" type="submit">Registrar Turno</button>' +
    '</form>';
}

function telaRelatorio() {
  var opts = appState.funcs.length ? appState.funcs.map(function(f){ return '<option value="' + f.nome + '">' + f.nome + '</option>'; }).join('') : '<option value="">Nenhum</option>';
  return '<button class="btn-home" onclick="irPara(\'menu\')">Voltar ao Inicio</button>' +
    '<form id="relForm" onsubmit="event.preventDefault();acaoBuscarRelatorio()">' +
    '<h2>📊 Relatorio de Pagamento</h2>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><label class="label">Funcionario</label><select id="selectFuncRel">' + opts + '</select></div>' +
    '<div><label class="label">Inicio</label><input type="date" id="relInicio" value="' + primeiroDiaMes() + '"></div></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><label class="label">Fim</label><input type="date" id="relFim" value="' + dataHoje() + '"></div>' +
    '<div style="display:flex;align-items:end"><button class="btn btn-primary" style="width:100%" type="submit">Buscar</button></div></div>' +
    '</form>' +
    '<div class="result-box" id="resultBox"><div style="color:var(--sec);text-align:center;padding:30px 0;font-size:14px">Preencha os filtros e clique em Buscar</div></div>';
}

function telaEditar() {
  var opts = appState.funcs.length ? appState.funcs.map(function(f){ return '<option value="' + f.nome + '">' + f.nome + '</option>'; }).join('') : '<option value="">Nenhum</option>';
  return '<button class="btn-home" onclick="irPara(\'menu\')">Voltar ao Inicio</button>' +
    '<form style="gap:10px">' +
    '<h2>🗑️ Excluir Registro</h2>' +
    '<label class="label">Selecione o Turno</label>' +
    '<select id="selectTurnoEdit"><option value="">Carregando...</option></select>' +
    '<button class="btn btn-danger" type="button" onclick="acaoExcluirRegistro()">Excluir Registro</button>' +
    '<div style="border-top:1px solid #2A2A2C;margin:8px 0"></div>' +
    '<h2 style="font-size:16px">🗑️ Excluir Funcionario</h2>' +
    '<label class="label">Selecione o Funcionario</label>' +
    '<select id="selectFuncEdit">' + opts + '</select>' +
    '<button class="btn btn-danger" type="button" onclick="acaoExcluirFuncionario()">Excluir Funcionario</button>' +
    '</form>';
}

function telaConfig() {
  var vm = obterConfig('valor_manha', 120);
  var vn = obterConfig('valor_noite', 100);
  return '<button class="btn-home" onclick="irPara(\'menu\')">Voltar ao Inicio</button>' +
    '<form onsubmit="event.preventDefault();acaoSalvarConfig()">' +
    '<h2>⚙️ Configuracoes</h2>' +
    '<label class="label">Valor Turno Manha (R$)</label>' +
    '<input type="number" id="valManha" step="0.01" min="0" value="' + vm.toFixed(2) + '">' +
    '<label class="label">Valor Turno Noite (R$)</label>' +
    '<input type="number" id="valNoite" step="0.01" min="0" value="' + vn.toFixed(2) + '">' +
    '<button class="btn btn-primary" type="submit">Salvar</button>' +
    '</form>';
}

// ===== ACOES =====
function acaoCadastrar() {
  var nome = document.getElementById('inputNome').value.trim();
  if (!nome) { toast('Digite um nome.', 'aviso'); return; }
  adicionarFuncionario(nome, function(err) {
    if (err) { toast(err === 'Funcionario ja existe' ? 'Funcionario ja cadastrado.' : 'Erro: ' + err, 'erro'); return; }
    toast('"' + nome + '" cadastrado!');
    irPara('menu');
  });
}

function acaoRegistrar() {
  var nome = document.getElementById('selectFuncReg').value;
  var turno = document.getElementById('selectTurno').value;
  var data = document.getElementById('inputDataReg').value;
  if (!nome) { toast('Cadastre um funcionario primeiro.', 'aviso'); return; }
  var func = appState.funcs.find(function(f){ return f.nome === nome; });
  if (!func) { toast('Funcionario nao encontrado.', 'erro'); return; }

  listarTurnos({ funcionario_id: func.id, inicio: data, fim: data }, function(lista) {
    if (lista.some(function(t){ return t.turno === turno; })) {
      toast('"' + nome + '" ja tem turno da ' + (turno === 'manha' ? 'Manha' : 'Noite') + ' nesta data.', 'erro');
      return;
    }
    var valor = turno === 'manha' ? obterConfig('valor_manha', 120) : obterConfig('valor_noite', 100);
    adicionarTurno({
      funcionario_id: func.id,
      funcionario_nome: func.nome,
      turno: turno,
      data: data,
      valor: valor
    }, function(err) {
      if (err) { toast('Erro: ' + err, 'erro'); return; }
      toast('Turno registrado para ' + nome + '!');
      document.getElementById('inputDataReg').value = dataHoje();
    });
  });
}

function acaoBuscarRelatorio() {
  var nome = document.getElementById('selectFuncRel').value;
  if (!nome) { toast('Selecione um funcionario.', 'aviso'); return; }
  var func = appState.funcs.find(function(f){ return f.nome === nome; });
  if (!func) { toast('Funcionario nao encontrado.', 'erro'); return; }

  var inicio = document.getElementById('relInicio').value;
  var fim = document.getElementById('relFim').value;

  listarTurnos({ funcionario_nome: nome, inicio: inicio, fim: fim }, function(turnos) {
    turnos.sort(function(a,b){ return a.data.localeCompare(b.data); });
    if (!turnos.length) { toast('Nenhum turno no periodo.', 'aviso'); return; }

    var dm = turnos.filter(function(t){ return t.turno === 'manha'; }).length;
    var dn = turnos.filter(function(t){ return t.turno === 'noite'; }).length;
    var vt = turnos.reduce(function(s,t){ return s + t.valor; }, 0);
    var periodo = inicio && fim ? formatarDataISO(inicio) + ' ate ' + formatarDataISO(fim) : '';

    appState.relDados = { nome: nome, funcionario_id: func.id, dias_manha: dm, dias_noite: dn, valor_total: vt, turnos: turnos, periodo: periodo, inicio: inicio, fim: fim };

    // load adiantamentos do periodo
    listarAdiantamentos({ funcionario_id: func.id, inicio: inicio, fim: fim }, function(ads) {
      appState.relDados.adiantamentos = ads;
      var totalAdiant = ads.reduce(function(s, a) { return s + a.valor; }, 0);
      appState.relDados.totalAdiantamento = totalAdiant;
      exibirResultado(appState.relDados);
    });
    toast('Dados carregados!');
  });
}

function exibirResultado(dados) {
  var box = document.getElementById('resultBox');
  if (!box) return;

  // ---- turnos history ----
  var hist = '';
  for (var i = 0; i < dados.turnos.length; i++) {
    var t = dados.turnos[i];
    var dt = formatarDataISO(t.data);
    var tNome = t.turno === 'manha' ? '☀️ Manha' : '🌙 Noite';
    var tCls = t.turno === 'manha' ? 'manha' : 'noite';
    hist += '<div class="history-item"><span class="h-date">📅 ' + dt + '</span><span class="h-turno ' + tCls + '">' + tNome + '</span><span class="h-valor">R$ ' + t.valor.toFixed(2) + '</span><button class="h-del" onclick="excluirTurnoRegistro(\'' + t.id + '\')">🗑️</button></div>';
  }

  // ---- adiantamentos list ----
  var ads = dados.adiantamentos || [];
  var adiantList = '';
  for (var j = 0; j < ads.length; j++) {
    var a = ads[j];
    var aDt = formatarDataISO(a.data);
    var aDesc = a.descricao ? ' - ' + a.descricao : '';
    adiantList += '<div class="history-item" style="border:1px solid #3A0000"><span class="h-date" style="color:#FF6B6B">📅 ' + aDt + '</span><span class="h-turno" style="color:#FF6B6B;flex:1">R$ ' + a.valor.toFixed(2) + aDesc + '</span><button class="h-del" onclick="acaoExcluirAdiantamento(\'' + a.id + '\')">🗑️</button></div>';
  }

  var totalAdiant = dados.totalAdiantamento || 0;
  var valorLiq = dados.valor_total - totalAdiant;

  var periodoHtml = dados.periodo ? '<div class="row"><span class="label-r">Periodo:</span><span class="value">' + dados.periodo + '</span></div>' : '';

  box.innerHTML =
    '<div class="row"><span class="label-r">Nome:</span><span class="value">' + dados.nome + '</span></div>' +
    periodoHtml +
    '<div class="row"><span class="label-r">Dias (Dia):</span><span class="value">' + dados.dias_manha + '</span></div>' +
    '<div class="row"><span class="label-r">Dias (Noite):</span><span class="value">' + dados.dias_noite + '</span></div>' +
    (totalAdiant > 0
      ? '<div class="total-highlight" style="margin-bottom:2px"><span class="label-r">Valor Bruto</span><span class="value">R$ ' + dados.valor_total.toFixed(2) + '</span></div><div class="adiantamento-box" style="padding:8px 12px;text-align:center"><div style="font-size:13px;color:var(--sec)">R$ ' + dados.valor_total.toFixed(2) + ' <span style="color:#555">(Bruto)</span><br><span style="color:#FF6B6B">\u2013 R$ ' + totalAdiant.toFixed(2) + ' <span style="color:#555">(Adiantamentos)</span></span><br><span style="font-weight:700;color:var(--gold)">= R$ ' + valorLiq.toFixed(2) + ' <span style="color:#555">(L\u00edquido)</span></span></div></div>'
      : '<div class="total-highlight" style="border-color:#D4AF37"><span class="label-r">Valor a Receber</span><span class="value" style="color:#D4AF37;font-size:20px">R$ ' + dados.valor_total.toFixed(2) + '</span></div>'
    ) +
    '<div class="adiantamento-box">' +
    '<label class="label" style="font-size:11px">Adiantamentos registrados no per\u00edodo</label>' +
    (ads.length ? '<div class="history-list" style="margin-top:4px">' + adiantList + '</div>' : '<div style="color:#555;font-size:12px;padding:4px 0">Nenhum adiantamento registrado.</div>') +
    '<div style="border-top:1px solid #2A2A2C;margin:8px 0 6px"></div>' +
    '<label class="label" style="font-size:11px">Novo adiantamento</label>' +
    '<div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">' +
    '<input type="date" id="inputAdiantData" value="' + dataHoje() + '" style="flex:1;min-width:80px;padding:6px;font-size:12px">' +
    '<input type="number" id="inputAdiantValor" step="0.01" min="0" placeholder="Valor R$" style="flex:1;min-width:80px;padding:6px;font-size:12px">' +
    '<input type="text" id="inputAdiantDesc" placeholder="Descri\u00e7\u00e3o (opc)" style="flex:2;min-width:80px;padding:6px;font-size:12px">' +
    '</div>' +
    '<button class="btn btn-sm btn-primary" style="width:100%;margin-top:6px;font-size:12px" onclick="acaoAdicionarAdiantamento()">+ Adicionar Adiantamento</button>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin:2px 0">' +
    '<button class="btn btn-sm" style="flex:1;font-size:12px" onclick="exportarPDF()">📄 Exportar PDF</button>' +
    '<button class="btn btn-sm" style="flex:1;font-size:12px" onclick="copiarWhatsApp()">📋 Copiar WPP</button></div>' +
    '<div><div style="color:var(--gold);font-size:12px;font-weight:700;margin-bottom:4px">📋 HISTORICO DE TURNOS</div><div class="history-list">' + hist + '</div></div>';
}

function acaoAdicionarAdiantamento() {
  if (!appState.relDados) { toast('Busque os dados primeiro.', 'aviso'); return; }
  var val = parseFloat(document.getElementById('inputAdiantValor').value);
  if (isNaN(val) || val <= 0) { toast('Digite um valor v\u00e1lido.', 'aviso'); return; }
  var data = document.getElementById('inputAdiantData').value || dataHoje();
  var desc = document.getElementById('inputAdiantDesc').value.trim();
  var funcId = appState.relDados.funcionario_id;

  adicionarAdiantamento({
    funcionario_id: funcId,
    funcionario_nome: appState.relDados.nome,
    data: data,
    valor: val,
    descricao: desc
  }, function(err) {
    if (err) { toast('Erro: ' + err, 'erro'); return; }
    toast('Adiantamento de R$ ' + val.toFixed(2) + ' registrado!');
    acaoBuscarRelatorio(); // reload everything
  });
}

function acaoExcluirAdiantamento(id) {
  modal('Excluir Adiantamento', 'Deseja excluir este adiantamento permanentemente?', function() {
    excluirAdiantamento(id, function(err) {
      if (err) { toast('Erro ao excluir.', 'erro'); return; }
      toast('Adiantamento exclu\u00eddo!');
      acaoBuscarRelatorio(); // reload everything
    });
  });
}

function excluirTurnoRegistro(id) {
  modal('Excluir Turno', 'Deseja excluir este registro permanentemente?', function(){
    excluirTurno(id, function(err) {
      if (err) { toast('Erro ao excluir.', 'erro'); return; }
      if (appState.relDados) {
        appState.relDados.turnos = appState.relDados.turnos.filter(function(t){ return t.id !== id; });
        appState.relDados.dias_manha = appState.relDados.turnos.filter(function(t){ return t.turno === 'manha'; }).length;
        appState.relDados.dias_noite = appState.relDados.turnos.filter(function(t){ return t.turno === 'noite'; }).length;
        appState.relDados.valor_total = appState.relDados.turnos.reduce(function(s,t){ return s + t.valor; }, 0);
        exibirResultado(appState.relDados);
      }
      toast('Turno excluido!');
    });
  });
}

function exportarPDF() {
  if (!appState.relDados) { toast('Busque os dados primeiro.', 'aviso'); return; }
  var d = appState.relDados;
  var pdfDados = {
    nome: d.nome,
    dias_manha: d.dias_manha,
    dias_noite: d.dias_noite,
    valor_total: d.valor_total,
    turnos: d.turnos,
    periodo: d.periodo,
    adiantamento: d.totalAdiantamento || 0,
    adiantamentos: d.adiantamentos || []
  };
  gerarPDF(pdfDados);
}

function copiarWhatsApp() {
  if (!appState.relDados) { toast('Busque os dados primeiro.', 'aviso'); return; }
  var d = appState.relDados;
  var periodo = d.periodo ? '\n*Periodo:* ' + d.periodo : '';
  var totalAdiant = d.totalAdiantamento || 0;
  var texto = '*Nome:* ' + d.nome + '.' + periodo + '\n*Dias (Dia):* ' + d.dias_manha + '\n*Dias (Noite):* ' + d.dias_noite + '\n*Valor Bruto:* R$ ' + d.valor_total.toFixed(2) + '.';
  if (totalAdiant > 0) {
    texto += '\n*Adiantamentos:* -R$ ' + totalAdiant.toFixed(2) + '\n*Valor L\u00edquido:* R$ ' + (d.valor_total - totalAdiant).toFixed(2) + '.';
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(function(){ toast('Copiado! Cole no WhatsApp.'); }).catch(function(){ fallbackCopy(texto); });
  } else { fallbackCopy(texto); }
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); toast('Copiado! Cole no WhatsApp.'); }
  catch(e) { toast('Erro ao copiar.', 'erro'); }
  document.body.removeChild(ta);
}

function acaoExcluirRegistro() {
  var id = document.getElementById('selectTurnoEdit').value;
  if (!id) { toast('Selecione um turno.', 'aviso'); return; }
  modal('Excluir Registro', 'Deseja excluir este registro permanentemente?', function(){
    excluirTurno(id, function(err) {
      if (err) { toast('Erro: ' + err, 'erro'); return; }
      toast('Registro excluido!');
      carregarTurnosEdicao();
    });
  });
}

function carregarTurnosEdicao() {
  var sel = document.getElementById('selectTurnoEdit');
  if (!sel) return;
  listarTurnos({}, function(lista) {
    if (lista.length) {
      sel.innerHTML = lista.map(function(t){
        return '<option value="' + t.id + '">' + formatarDataISO(t.data) + ' - ' + t.funcionario_nome + ' - ' + (t.turno === 'manha' ? 'Manha' : 'Noite') + '</option>';
      }).join('');
    } else {
      sel.innerHTML = '<option value="">Nenhum turno registrado</option>';
    }
  });
}

function acaoExcluirFuncionario() {
  var nome = document.getElementById('selectFuncEdit').value;
  if (!nome) { toast('Selecione um funcionario.', 'aviso'); return; }
  modal('Excluir Funcionario', 'Tem certeza que deseja excluir "' + nome + '" e TODOS os seus registros?', function(){
    excluirFuncionario(nome, function(err) {
      if (err) { toast('Erro: ' + err, 'erro'); return; }
      toast('"' + nome + '" excluido!');
      irPara('menu');
    });
  });
}

function acaoSalvarConfig() {
  var vm = parseFloat(document.getElementById('valManha').value);
  var vn = parseFloat(document.getElementById('valNoite').value);
  if (isNaN(vm) || isNaN(vn) || vm < 0 || vn < 0) { toast('Valores invalidos.', 'erro'); return; }
  salvarConfig('valor_manha', vm, function(){
    salvarConfig('valor_noite', vn, function(){
      toast('Precos salvos!');
      irPara('menu');
    });
  });
}
