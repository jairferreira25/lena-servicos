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
  img.onerror = function() {
    _logoBase64 = null;
    if (callback) callback(null);
  };
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
    var G = [212, 175, 55];
    var cor = function(r, g, b) { pdf.setFillColor(r, g, b); pdf.setDrawColor(r, g, b); };
    var gold = function() { pdf.setTextColor(G[0], G[1], G[2]); };
    var white = function() { pdf.setTextColor(255, 255, 255); };
    var gray = function() { pdf.setTextColor(160, 160, 160); };
    var goldPen = function() { pdf.setDrawColor(G[0], G[1], G[2]); };

    cor(10, 10, 10);
    pdf.rect(0, 0, W, H, 'F');

    goldPen();
    pdf.setLineWidth(1.5);
    cor(20, 18, 12);
    pdf.triangle(0, 0, 45, 0, 0, 45, 'F');
    pdf.line(0, 45, 45, 0);
    pdf.triangle(W, 0, W - 45, 0, W, 45, 'F');
    pdf.line(W - 45, 0, W, 45);
    pdf.triangle(0, H, 45, H, 0, H - 45, 'F');
    pdf.line(0, H - 45, 45, H);
    pdf.triangle(W, H, W - 45, H, W, H - 45, 'F');
    pdf.line(W - 45, H, W, H - 45);

    var y = 18;

    carregarLogo(function(logo) {
      if (logo) {
        try {
          pdf.addImage(logo, 'PNG', W / 2 - 12, y - 4, 24, 12);
          y += 16;
        } catch (e) {
          y = y;
        }
      }

      gold();
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text('LENA SERVICOS', W / 2, y + 4, { align: 'center' });
      y += 12;

      goldPen();
      pdf.setLineWidth(0.3);
      pdf.line(30, y, W - 30, y);
      y += 4;

      white();
      pdf.setFontSize(9);
      pdf.text('RELATORIO DE PAGAMENTO', W / 2, y, { align: 'center' });
      y += 8;

      if (dados.periodo) {
        gray();
        pdf.setFontSize(8);
        pdf.text('Periodo: ' + dados.periodo, W / 2, y, { align: 'center' });
        y += 7;
      }

      cor(28, 28, 30);
      goldPen();
      pdf.setLineWidth(0.5);
      pdf.roundedRect(15, y, 180, 18, 3, 3, 'FD');

      gold();
      pdf.setFontSize(7);
      pdf.text('COLABORADOR', 22, y + 4);
      white();
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text(dados.nome.toUpperCase(), 22, y + 13);
      pdf.setFont('helvetica', 'normal');
      y += 26;

      gold();
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATA', 22, y);
      pdf.text('TURNO', 85, y);
      pdf.text('VALOR', 150, y);
      pdf.text('STATUS', 175, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setDrawColor(60, 60, 60);
      pdf.line(15, y + 0.5, 195, y + 0.5);
      y += 6;

      var count = 0;
      var linhasPorPag = 14;
      for (var i = 0; i < dados.turnos.length; i++) {
        var t = dados.turnos[i];
        if (count > 0 && count % linhasPorPag === 0) {
          pdf.addPage();
          cor(10, 10, 10);
          pdf.rect(0, 0, W, H, 'F');
          goldPen();
          cor(20, 18, 12);
          pdf.triangle(0, 0, 45, 0, 0, 45, 'F');
          pdf.line(0, 45, 45, 0);
          pdf.triangle(W, 0, W - 45, 0, W, 45, 'F');
          pdf.line(W - 45, 0, W, 45);
          pdf.line(30, 10, W - 30, 10);
          y = 20;
          gold();
          pdf.setFontSize(8);
          pdf.text('DATA', 22, y);
          pdf.text('TURNO', 85, y);
          pdf.text('VALOR', 150, y);
          pdf.text('STATUS', 175, y);
          pdf.setDrawColor(60, 60, 60);
          pdf.line(15, y + 0.5, 195, y + 0.5);
          y += 6;
        }

        var dt = formatarDataISO(t.data);
        var tNome = t.turno === 'manha' ? 'Manha' : 'Noite';
        var tCls = t.turno === 'manha' ? [G[0], G[1], G[2]] : [90, 156, 255];

        cor(count % 2 === 0 ? 28 : 24, count % 2 === 0 ? 28 : 24, count % 2 === 0 ? 30 : 26);
        pdf.rect(15, y - 1.5, 180, 6.5, 'F');

        white();
        pdf.setFontSize(8);
        pdf.text(dt, 22, y + 1.5);

        pdf.setTextColor(tCls[0], tCls[1], tCls[2]);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text((t.turno === 'manha' ? '☀ ' : '☽ ') + tNome, 85, y + 1.5);
        pdf.setFont('helvetica', 'normal');

        white();
        pdf.text('R$ ' + t.valor.toFixed(2), 150, y + 1.5);

        pdf.setTextColor(76, 175, 80);
        pdf.setFontSize(7);
        pdf.text('OK', 175, y + 2);
        pdf.setFontSize(8);

        y += 6.5;
        count++;
      }

      y += 8;
      if (y > 235) { pdf.addPage(); cor(10, 10, 10); pdf.rect(0, 0, W, H, 'F'); y = 15; }

      var cw = 56, ch = 16, gap = 6, sx = 15;
      var cards = [
        { label: 'DIAS (DIA)', valor: '' + dados.dias_manha, cor: G },
        { label: 'DIAS (NOITE)', valor: '' + dados.dias_noite, cor: [90, 156, 255] },
        { label: 'VALOR TOTAL', valor: 'R$ ' + dados.valor_total.toFixed(2), cor: G, destaque: true }
      ];

      for (var ci = 0; ci < cards.length; ci++) {
        var cx = sx + ci * (cw + gap);
        cor(28, 28, 30);
        if (cards[ci].destaque) {
          goldPen();
          pdf.setLineWidth(0.8);
        } else {
          pdf.setDrawColor(50, 50, 52);
          pdf.setLineWidth(0.3);
        }
        pdf.roundedRect(cx, y, cw, ch, 3, 3, 'FD');

        pdf.setTextColor(cards[ci].cor[0], cards[ci].cor[1], cards[ci].cor[2]);
        pdf.setFontSize(5.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(cards[ci].label, cx + 4, y + 4);

        white();
        pdf.setFontSize(cards[ci].destaque ? 9 : 11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(cards[ci].valor, cx + 4, y + 12);
        pdf.setFont('helvetica', 'normal');
      }

      y += 24;

      cor(20, 20, 22);
      pdf.setDrawColor(40, 40, 42);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(15, y, 180, 10, 3, 3, 'FD');

      gold();
      pdf.setFontSize(6);
      pdf.text('LENA SERVICOS', 22, y + 6);

      pdf.setTextColor(150, 150, 150);
      pdf.text('Agradecemos pelo seu compromisso e dedicacao.', W / 2, y + 6, { align: 'center' });

      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(5.5);
      pdf.text(APP_CONFIG.nome + ' v' + APP_CONFIG.versao + ' - Gerado em ' + new Date().toLocaleString('pt-BR'), 190, y + 6, { align: 'right' });

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
