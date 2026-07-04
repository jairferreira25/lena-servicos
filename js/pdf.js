var _logoBase64 = null;

function carregarLogo(callback) {
  if (_logoBase64) { if (callback) callback(_logoBase64); return; }
  var img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    var c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    _logoBase64 = c.toDataURL('image/png');
    if (callback) callback(_logoBase64);
  };
  img.onerror = function() { _logoBase64 = null; if (callback) callback(null); };
  img.src = 'assets/logo.png';
}

function gerarPDF(dados) {
  try {
    var jsPDF = window.jspdf ? window.jspdf.jsPDF : null;
    if (!jsPDF && typeof jspdf !== 'undefined') jsPDF = jspdf.jsPDF;
    if (!jsPDF) {
      toast('Carregando biblioteca PDF...', 'aviso');
      carregarJsPDF(function() { gerarPDF(dados); });
      return;
    }

    var pdf = new jsPDF('p', 'mm', 'a4');
    var W = 210, H = 297;
    var GOLD = '#D4AF37';
    var BG = '#0B0B0B';
    var CARD = '#1A1A1C';

    var setGold = function() { pdf.setTextColor(212, 175, 55); };
    var setWhite = function() { pdf.setTextColor(255, 255, 255); };
    var setGray = function() { pdf.setTextColor(160, 160, 160); };
    var fillBg = function() { pdf.setFillColor(11, 11, 11); pdf.rect(0, 0, W, H, 'F'); };
    var fillCard = function() { pdf.setFillColor(26, 26, 28); };
    var drawGoldLine = function(y) { pdf.setDrawColor(212, 175, 55); pdf.setLineWidth(0.3); pdf.line(25, y, W - 25, y); };

    fillBg();

    var y = 0;

    carregarLogo(function(logo) {
      // ===== LOGO =====
      y = 14;
      if (logo) {
        try {
          var ls = 16;
          pdf.setDrawColor(255, 255, 255);
          pdf.setLineWidth(0.5);
          pdf.rect(W / 2 - ls / 2 - 1, y - 1, ls + 2, ls + 2, 'S');
          pdf.addImage(logo, 'PNG', W / 2 - ls / 2, y, ls, ls);
          y += ls + 8;
        } catch (e) {}
      }

      // ===== NOME EMPRESA =====
      setGold();
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.text('LENA SERVICOS', W / 2, y, { align: 'center' });
      y += 9;

      // ===== SUBTITULO =====
      setWhite();
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('R E L A T O R I O   D E   P A G A M E N T O', W / 2, y, { align: 'center', charSpace: 2 });
      y += 5;

      drawGoldLine(y);
      y += 4;

      if (dados.periodo) {
        setGray();
        pdf.setFontSize(7);
        pdf.text('Periodo: ' + dados.periodo, W / 2, y, { align: 'center' });
        y += 7;
      }

      // ===== CARD COLABORADOR =====
      fillCard();
      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(18, y, 174, 18, 4, 4, 'FD');

      pdf.setDrawColor(212, 175, 55);
      pdf.setFillColor(212, 175, 55);
      pdf.circle(30, y + 9, 5, 'FD');
      setWhite();
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text('U', 30, y + 10, { align: 'center' });

      setGold();
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6);
      pdf.text('NOME DO COLABORADOR', 40, y + 5);

      setWhite();
      pdf.setFontSize(12);
      pdf.text(dados.nome.toUpperCase(), 40, y + 14);

      y += 26;

      // ===== SECAO DETALHAMENTO =====
      setGold();
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('DETALHAMENTO DOS DIAS TRABALHADOS', 18, y);
      y += 7;

      // ===== CABECALHO TABELA =====
      setGold();
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATA', 18, y);
      pdf.text('TURNO', 80, y);
      pdf.text('VALOR', 175, y, { align: 'right' });

      pdf.setDrawColor(60, 60, 62);
      pdf.setLineWidth(0.2);
      pdf.line(18, y + 0.5, 192, y + 0.5);
      y += 5;

      var count = 0;
      var linhasPorPag = 16;

      for (var i = 0; i < dados.turnos.length; i++) {
        var t = dados.turnos[i];

        if (count > 0 && count % linhasPorPag === 0) {
          pdf.addPage();
          fillBg();
          setGold();
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'bold');
          pdf.text('DATA', 18, 18);
          pdf.text('TURNO', 80, 18);
          pdf.text('VALOR', 175, 18, { align: 'right' });
          pdf.setDrawColor(60, 60, 62);
          pdf.line(18, 18.5, 192, 18.5);
          y = 23;
        }

        var dt = formatarDataISO(t.data);
        var tNome = t.turno === 'manha' ? 'Manha' : 'Noite';

        // Alterna fundo entre escuro e mais claro
        if (count % 2 === 0) {
          pdf.setFillColor(26, 26, 28);
        } else {
          pdf.setFillColor(32, 30, 24);
        }
        pdf.rect(16, y - 1.5, 178, 6, 'F');

        setWhite();
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(dt, 18, y + 1.5);

        if (t.turno === 'manha') {
          setGold();
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          pdf.text('\u2600 ' + tNome, 78, y + 1.5);
        } else {
          pdf.setTextColor(90, 156, 255);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          pdf.text('\u263D ' + tNome, 78, y + 1.5);
        }

        setWhite();
        pdf.text('R$ ' + t.valor.toFixed(2), 175, y + 1.5, { align: 'right' });

        y += 6.5;
        count++;
      }

      y += 8;
      if (y > 230) { pdf.addPage(); fillBg(); y = 18; }

      // ===== CARDS DE RESUMO =====
      var cw = 56, ch = 22, gap = 5, sx = 18;

      var cards = [
        { label: 'Total de Dias (Dia)', valor: '' + dados.dias_manha, cor: [212, 175, 55] },
        { label: 'Total de Dias (Noite)', valor: '' + dados.dias_noite, cor: [90, 156, 255] },
        { label: 'Valor Total a Receber', valor: 'R$ ' + dados.valor_total.toFixed(2), cor: [212, 175, 55], destaque: true }
      ];

      for (var ci = 0; ci < cards.length; ci++) {
        var cx = sx + ci * (cw + gap);

        fillCard();
        if (cards[ci].destaque) {
          pdf.setDrawColor(212, 175, 55);
          pdf.setLineWidth(0.5);
        } else {
          pdf.setDrawColor(50, 50, 52);
          pdf.setLineWidth(0.3);
        }
        pdf.roundedRect(cx, y, cw, ch, 4, 4, 'FD');

        pdf.setDrawColor(212, 175, 55);
        pdf.setFillColor(212, 175, 55);
        pdf.circle(cx + 8, y + 6, 2.5, 'FD');

        pdf.setTextColor(180, 180, 180);
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(cards[ci].label, cx + 14, y + 5);

        setWhite();
        pdf.setFontSize(cards[ci].destaque ? 10 : 14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(cards[ci].cor[0], cards[ci].cor[1], cards[ci].cor[2]);
        pdf.text(cards[ci].valor, cx + 6, y + 16);
      }

      y += 30;

      // ===== RODAPE =====
      if (y > 270) { pdf.addPage(); fillBg(); y = 15; }

      fillCard();
      pdf.setDrawColor(50, 50, 52);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(18, y, 174, 12, 4, 4, 'FD');

      pdf.setDrawColor(212, 175, 55);
      pdf.setFillColor(212, 175, 55);
      pdf.circle(30, y + 6, 2.5, 'FD');

      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(6.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Agradecemos pelo seu compromisso e dedicacao.', 38, y + 5);

      setGold();
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('LENA SERVICOS', 185, y + 5, { align: 'right' });

      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(4.5);
      pdf.text('v' + APP_CONFIG.versao + ' | ' + new Date().toLocaleString('pt-BR'), 185, y + 9, { align: 'right' });

      // ===== DOWNLOAD =====
      var nomeArquivo = 'Relatorio_' + dados.nome.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') + '.pdf';
      var blob = pdf.output('blob');
      var url = URL.createObjectURL(blob);

      var a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      toast('Download: ' + nomeArquivo);

      setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (navigator.canShare && navigator.canShare({ files: [new File([blob], nomeArquivo, { type: 'application/pdf' })] })) {
          navigator.share({
            title: 'Relatorio ' + dados.nome,
            files: [new File([blob], nomeArquivo, { type: 'application/pdf' })]
          }).catch(function() {});
        }
      }, 2000);
    });
  } catch (e) {
    toast('Erro PDF: ' + (e.message || e), 'erro');
    console.error(e);
  }
}

var _carregandoJsPDF = false;
function carregarJsPDF(callback) {
  if (_carregandoJsPDF) { setTimeout(function() { carregarJsPDF(callback); }, 1000); return; }
  _carregandoJsPDF = true;
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  s.onload = function() { _carregandoJsPDF = false; if (callback) callback(); };
  s.onerror = function() {
    var s2 = document.createElement('script');
    s2.src = 'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js';
    s2.onload = function() { _carregandoJsPDF = false; if (callback) callback(); };
    s2.onerror = function() { _carregandoJsPDF = false; toast('Falha ao carregar PDF.', 'erro'); };
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
}
