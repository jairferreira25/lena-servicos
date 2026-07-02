function gerarPDF(dados) {
  try {
    var jsPDF = window.jspdf ? window.jspdf.jsPDF : null;
    if (!jsPDF && typeof jspdf !== 'undefined') jsPDF = jspdf.jsPDF;
    if (!jsPDF) {
      toast('Carregando biblioteca PDF...', 'aviso');
      carregarJsPDF(function(){ gerarPDF(dados); });
      return;
    }

    var pdf = new jsPDF('p', 'mm', 'a4');
    var W = 210, H = 297;
    var G = [212, 175, 55]; // gold
    var cor = function(r,g,b){ pdf.setFillColor(r,g,b); pdf.setDrawColor(r,g,b); };

    // === FUNDO ===
    cor(10,10,10);
    pdf.rect(0,0,W,H,'F');

    // === CANTOS DOURADOS ===
    pdf.setDrawColor(G[0],G[1],G[2]);
    pdf.setLineWidth(1.5);
    pdf.setFillColor(20,18,12);
    // Superior esquerdo
    pdf.triangle(0,0, 45,0, 0,45, 'F');
    pdf.line(0,45, 45,0);
    // Superior direito
    pdf.triangle(W,0, W-45,0, W,45, 'F');
    pdf.line(W-45,0, W,45);
    // Inferior esquerdo
    pdf.triangle(0,H, 45,H, 0,H-45, 'F');
    pdf.line(0,H-45, 45,H);
    // Inferior direito
    pdf.triangle(W,H, W-45,H, W,H-45, 'F');
    pdf.line(W-45,H, W,H-45);

    // === LOGO (se disponivel) ===
    try {
      var logo = document.querySelector('link[rel="icon"]');
      // Tenta usar assets/logo.png inline
    } catch(e){}

    // === CABECALHO ===
    pdf.setTextColor(G[0],G[1],G[2]);
    pdf.setFont('helvetica','bold');
    pdf.setFontSize(22);
    pdf.text('LENA SERVICOS', W/2, 28, {align:'center'});

    pdf.setDrawColor(G[0],G[1],G[2]);
    pdf.setLineWidth(0.3);
    pdf.line(30,33, W-30,33);

    pdf.setTextColor(255,255,255);
    pdf.setFontSize(9);
    pdf.text('RELATORIO DE PAGAMENTO', W/2, 40, {align:'center'});

    var y = 48;

    // === PERIODO ===
    if (dados.periodo) {
      pdf.setTextColor(160,160,160);
      pdf.setFontSize(8);
      pdf.text('Periodo: ' + dados.periodo, W/2, y, {align:'center'});
      y += 6;
    }

    // === CARD COLABORADOR ===
    cor(28,28,30);
    pdf.setDrawColor(G[0],G[1],G[2]);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(15, y, 180, 18, 3,3, 'FD');

    pdf.setTextColor(G[0],G[1],G[2]);
    pdf.setFontSize(7);
    pdf.text('COLABORADOR', 22, y+4);

    pdf.setTextColor(255,255,255);
    pdf.setFontSize(13);
    pdf.setFont('helvetica','bold');
    pdf.text(dados.nome.toUpperCase(), 22, y+13);
    pdf.setFont('helvetica','normal');
    y += 26;

    // === TABELA DE DIAS ===
    pdf.setTextColor(G[0],G[1],G[2]);
    pdf.setFontSize(8);
    pdf.setFont('helvetica','bold');
    pdf.text('DATA', 22, y);
    pdf.text('TURNO', 85, y);
    pdf.text('VALOR', 150, y);
    pdf.text('STATUS', 175, y);
    pdf.setFont('helvetica','normal');
    pdf.setDrawColor(60,60,60);
    pdf.line(15,y+0.5, 195, y+0.5);
    y += 6;

    // Linhas da tabela
    var count = 0;
    var linhasPorPag = 14;
    for (var i = 0; i < dados.turnos.length; i++) {
      var t = dados.turnos[i];
      if (count > 0 && count % linhasPorPag === 0) {
        pdf.addPage();
        cor(10,10,10);
        pdf.rect(0,0,W,H,'F');
        // Cantos nas novas paginas
        pdf.setDrawColor(G[0],G[1],G[2]);
        pdf.setFillColor(20,18,12);
        pdf.triangle(0,0, 45,0, 0,45, 'F');
        pdf.line(0,45, 45,0);
        pdf.triangle(W,0, W-45,0, W,45, 'F');
        pdf.line(W-45,0, W,45);
        pdf.line(30,10, W-30,10);
        y = 20;
        pdf.setTextColor(G[0],G[1],G[2]);
        pdf.setFontSize(8);
        pdf.text('DATA', 22, y);
        pdf.text('TURNO', 85, y);
        pdf.text('VALOR', 150, y);
        pdf.text('STATUS', 175, y);
        pdf.setDrawColor(60,60,60);
        pdf.line(15,y+0.5, 195, y+0.5);
        y += 6;
      }

      var dt = formatarDataISO(t.data);
      var tNome = t.turno === 'manha' ? 'Manha' : 'Noite';
      var tCls = t.turno === 'manha' ? [G[0],G[1],G[2]] : [90,156,255];

      // Fundo da linha (alternado)
      cor(count % 2 === 0 ? 28 : 24, count % 2 === 0 ? 28 : 24, count % 2 === 0 ? 30 : 26);
      pdf.rect(15, y-1.5, 180, 6.5, 'F');

      // Data
      pdf.setTextColor(255,255,255);
      pdf.setFontSize(8);
      pdf.text(dt, 22, y+1.5);

      // Turno com icone
      pdf.setTextColor(tCls[0],tCls[1],tCls[2]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica','bold');
      pdf.text((t.turno === 'manha' ? '☀️ ' : '🌙 ') + tNome, 85, y+1.5);
      pdf.setFont('helvetica','normal');

      // Valor
      pdf.setTextColor(255,255,255);
      pdf.text('R$ ' + t.valor.toFixed(2), 150, y+1.5);

      // Status
      pdf.setTextColor(76,175,80);
      pdf.setFontSize(7);
      pdf.text('OK', 175, y+2);
      pdf.setFontSize(8);

      y += 6.5;
      count++;
    }

    y += 8;
    if (y > 235) { pdf.addPage(); cor(10,10,10); pdf.rect(0,0,W,H,'F'); y = 15; }

    // === CARDS DE RESUMO ===
    var cw = 56, ch = 16, gap = 6, sx = 15;
    var cards = [
      { label: 'DIAS (DIA)', valor: ''+dados.dias_manha, cor: G },
      { label: 'DIAS (NOITE)', valor: ''+dados.dias_noite, cor: [90,156,255] },
      { label: 'VALOR TOTAL', valor: 'R$ ' + dados.valor_total.toFixed(2), cor: G, destaque: true }
    ];

    for (var ci = 0; ci < cards.length; ci++) {
      var cx = sx + ci*(cw+gap);
      cor(28,28,30);
      if (cards[ci].destaque) {
        pdf.setDrawColor(G[0],G[1],G[2]);
        pdf.setLineWidth(0.8);
      } else {
        pdf.setDrawColor(50,50,52);
        pdf.setLineWidth(0.3);
      }
      pdf.roundedRect(cx, y, cw, ch, 3,3, 'FD');

      pdf.setTextColor(cards[ci].cor[0], cards[ci].cor[1], cards[ci].cor[2]);
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica','bold');
      pdf.text(cards[ci].label, cx+4, y+4);

      pdf.setTextColor(255,255,255);
      pdf.setFontSize(cards[ci].destaque ? 9 : 11);
      pdf.setFont('helvetica','bold');
      pdf.text(cards[ci].valor, cx+4, y+12);
      pdf.setFont('helvetica','normal');
    }

    y += 24;

    // === RODAPE ===
    cor(20,20,22);
    pdf.setDrawColor(40,40,42);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(15, y, 180, 10, 3,3, 'FD');

    pdf.setTextColor(G[0],G[1],G[2]);
    pdf.setFontSize(6);
    pdf.text('LENA SERVICOS', 22, y+6);

    pdf.setTextColor(150,150,150);
    pdf.text('Agradecemos pelo seu compromisso e dedicacao.', W/2, y+6, {align:'center'});

    pdf.setTextColor(100,100,100);
    pdf.setFontSize(5.5);
    pdf.text(APP_CONFIG.nome + ' v' + APP_CONFIG.versao + ' - Gerado em ' + new Date().toLocaleString('pt-BR'), 190, y+6, {align:'right'});

    // === SALVAR ===
    var nomeArquivo = 'Relatorio_' + dados.nome.replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_]/g,'') + '.pdf';
    var blob = pdf.output('blob');
    var url = URL.createObjectURL(blob);

    if (navigator.canShare && navigator.canShare({ files: [new File([blob], nomeArquivo, {type:'application/pdf'})] })) {
      navigator.share({
        title: 'Relatorio ' + dados.nome,
        files: [new File([blob], nomeArquivo, {type:'application/pdf'})]
      }).then(function(){ toast('PDF salvo/compartilhado!'); })
        .catch(function(){ baixarBlob(url, nomeArquivo); });
    } else {
      baixarBlob(url, nomeArquivo);
    }
  } catch(e) {
    toast('Erro PDF: ' + (e.message || e), 'erro');
    console.error(e);
  }
}

function baixarBlob(url, nome) {
  var a = document.createElement('a');
  a.href = url; a.download = nome; a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 3000);
  toast('Download: ' + nome);
}

var _carregandoJsPDF = false;
function carregarJsPDF(callback) {
  if (_carregandoJsPDF) { setTimeout(function(){ carregarJsPDF(callback); }, 1000); return; }
  _carregandoJsPDF = true;
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  s.onload = function(){ _carregandoJsPDF = false; if (callback) callback(); };
  s.onerror = function(){
    var s2 = document.createElement('script');
    s2.src = 'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js';
    s2.onload = function(){ _carregandoJsPDF = false; if (callback) callback(); };
    s2.onerror = function(){ _carregandoJsPDF = false; toast('Falha ao carregar PDF.', 'erro'); };
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
}
