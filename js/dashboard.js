var dashChart1 = null;
var dashChart2 = null;

function telaDashboard() {
  return '<button class="btn-home" onclick="irPara(\'menu\')">Voltar ao Inicio</button>' +
    '<h2>📊 Dashboard</h2>' +
    '<div class="filter-bar">' +
    '<select id="dashFunc"><option value="">Todos</option>' + appState.funcs.map(function(f){ return '<option value="' + f.nome + '">' + f.nome + '</option>'; }).join('') + '</select>' +
    '<input type="month" id="dashMes" value="' + new Date().toISOString().slice(0,7) + '">' +
    '<button class="btn btn-sm" onclick="atualizarDashboard()" style="flex:0">Filtrar</button>' +
    '</div>' +
    '<div class="dash-grid" id="dashCards"></div>' +
    '<div class="chart-container"><canvas id="dashChart"></canvas></div>' +
    '<div class="chart-container"><canvas id="dashChart2"></canvas></div>';
}

function initDashboard() {
  atualizarDashboard();
}

function atualizarDashboard() {
  var funcNome = document.getElementById('dashFunc').value;
  var mes = document.getElementById('dashMes').value; // YYYY-MM
  var ano = mes ? mes.slice(0,4) : '' + new Date().getFullYear();
  var mesNum = mes ? mes.slice(5,7) : '';

  var inicio = mes ? ano + '-' + mesNum + '-01' : ano + '-01-01';
  var fim = mes ? (function(){
    var d = new Date(parseInt(ano), parseInt(mesNum), 0);
    return ano + '-' + mesNum + '-' + d.getDate();
  })() : ano + '-12-31';

  listarTurnos({ inicio: inicio, fim: fim, funcionario_nome: funcNome }, function(turnos) {
    var totalFunc = appState.funcs.length;
    var funcAtivos = [];
    var funcIds = {};
    appState.funcs.forEach(function(f){ funcIds[f.nome] = true; });

    var diasManha = 0, diasNoite = 0;
    var totalPago = 0;
    var funcPago = {};
    var dadosPorDia = {};
    var turnosPorFunc = {};

    turnos.forEach(function(t) {
      if (t.turno === 'manha') diasManha++;
      else diasNoite++;
      totalPago += t.valor;
      if (t.funcionario_nome) {
        funcPago[t.funcionario_nome] = (funcPago[t.funcionario_nome] || 0) + t.valor;
        turnosPorFunc[t.funcionario_nome] = (turnosPorFunc[t.funcionario_nome] || 0) + 1;
      }
      if (t.data) {
        dadosPorDia[t.data] = (dadosPorDia[t.data] || 0) + 1;
      }
    });

    funcAtivos = Object.keys(turnosPorFunc);
    var totalTurnos = turnos.length;
    var mediaSalarial = funcAtivos.length ? totalPago / funcAtivos.length : 0;

    // Cards
    document.getElementById('dashCards').innerHTML =
      '<div class="dash-card"><div class="dash-label">Funcionarios</div><div class="dash-num">' + totalFunc + '</div><div style="color:var(--sec);font-size:10px">' + funcAtivos.length + ' ativos</div></div>' +
      '<div class="dash-card"><div class="dash-label">Total Periodo</div><div class="dash-num" style="font-size:20px">R$ ' + totalPago.toFixed(2) + '</div></div>' +
      '<div class="dash-card"><div class="dash-label">Turnos Dia</div><div class="dash-num">' + diasManha + '</div></div>' +
      '<div class="dash-card"><div class="dash-label">Turnos Noite</div><div class="dash-num">' + diasNoite + '</div></div>' +
      '<div class="dash-card highlight"><div class="dash-label">Total Turnos</div><div class="dash-num">' + totalTurnos + '</div></div>' +
      '<div class="dash-card"><div class="dash-label">Media Salarial</div><div class="dash-num" style="font-size:18px">R$ ' + mediaSalarial.toFixed(2) + '</div></div>';

    // Grafico 1: Turnos por funcionario
    var ctx1 = document.getElementById('dashChart');
    if (!ctx1) return;
    if (dashChart1) dashChart1.destroy();

    var labels1 = Object.keys(turnosPorFunc).sort();
    var dados1 = labels1.map(function(n){ return turnosPorFunc[n]; });

    dashChart1 = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: labels1,
        datasets: [{
          label: 'Turnos',
          data: dados1,
          backgroundColor: 'rgba(212,175,55,0.7)',
          borderColor: '#D4AF37',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false }, title: { display: true, text: 'Turnos por Funcionario', color: '#D4AF37', font: { size: 12 } } },
        scales: { y: { beginAtZero: true, ticks: { color: '#A0A0A0', stepSize: 1 } }, x: { ticks: { color: '#A0A0A0', maxRotation: 45 } } }
      }
    });

    // Grafico 2: Dias x Valor
    var ctx2 = document.getElementById('dashChart2');
    if (!ctx2) return;

    var datasOrdenadas = Object.keys(dadosPorDia).sort();
    var labels2 = datasOrdenadas.map(function(d){ return formatarDataISO(d); });
    var turnosPorData = datasOrdenadas.map(function(d){ return dadosPorDia[d]; });
    var valorPorData = datasOrdenadas.map(function(d){
      return turnos.filter(function(t){ return t.data === d; }).reduce(function(s,t){ return s + t.valor; }, 0);
    });

    if (dashChart2) dashChart2.destroy();
    dashChart2 = new Chart(ctx2, {
      type: 'line',
      data: {
        labels: labels2,
        datasets: [
          { label: 'Turnos', data: turnosPorData, borderColor: '#D4AF37', backgroundColor: 'rgba(212,175,55,0.1)', fill: true, tension: 0.3, pointRadius: 3, yAxisID: 'y' },
          { label: 'Valor (R$)', data: valorPorData, borderColor: '#5A9CFF', backgroundColor: 'rgba(90,156,255,0.1)', fill: true, tension: 0.3, pointRadius: 3, yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { title: { display: true, text: 'Dias x Valor', color: '#D4AF37', font: { size: 12 } } },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#A0A0A0', stepSize: 1 }, position: 'left', grid: { color: '#1A1A1A' } },
          y1: { beginAtZero: true, ticks: { color: '#5A9CFF' }, position: 'right', grid: { display: false } },
          x: { ticks: { color: '#A0A0A0', maxRotation: 45 } }
        }
      }
    });
  });
}
