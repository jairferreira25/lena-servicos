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

    var C = {
      bg: '#0B0B0B',
      card: '#1A1A1C',
      cardAlt: '#222125',
      gold: '#D4AF37',
      white: '#FFFFFF',
      gray: '#A0A0A0',
      darkGray: '#666666',
      blue: '#5A9CFF',
      footer: '#18181A'
    };

    function hexToRgb(h) {
      var r = parseInt(h.slice(1, 3), 16);
      var g = parseInt(h.slice(3, 5), 16);
      var b = parseInt(h.slice(5, 7), 16);
      return [r, g, b];
    }

    function setColor(hex) { var c = hexToRgb(hex); pdf.setTextColor(c[0], c[1], c[2]); }
    function setFill(hex) { var c = hexToRgb(hex); pdf.setFillColor(c[0], c[1], c[2]); }
    function setDraw(hex) { var c = hexToRgb(hex); pdf.setDrawColor(c[0], c[1], c[2]); }

    function fillBg() {
      setFill(C.bg);
      pdf.rect(0, 0, W, H, 'F');
    }

    function goldLine(y) {
      setDraw(C.gold);
      pdf.setLineWidth(0.3);
      pdf.line(25, y, W - 25, y);
    }

    function box(x, y, w, h, hex, r) {
      setFill(hex);
      pdf.roundedRect(x, y, w, h, r || 4, r || 4, 'F');
    }

    fillBg();

    carregarLogo(function(logo) {
      var y = 14;

      // ===== 1. LOGO =====
      if (logo) {
        try {
          var ls = 18;
          setDraw(C.white);
          pdf.setLineWidth(0.4);
          pdf.rect(W / 2 - ls / 2 - 0.8, y - 0.8, ls + 1.6, ls + 1.6, 'S');
          pdf.addImage(logo, 'PNG', W / 2 - ls / 2, y, ls, ls);
          y += ls + 7;
        } catch (e) {}
      }

      // ===== 2. EMPRESA =====
      setColor(C.gold);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.text('LENA SERVI\u00c7OS', W / 2, y, { align: 'center' });
      y += 10;

      // ===== 3. RELAT\u00d3RIO =====
      setColor(C.white);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('RELAT\u00d3RIO DE PAGAMENTO', W / 2, y, { align: 'center' });
      y += 6;

      goldLine(y);
      y += 5;

      // ===== 4. PER\u00cdODO =====
      if (dados.periodo) {
        setColor(C.gray);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text('Per\u00edodo: ' + dados.periodo, W / 2, y, { align: 'center' });
        y += 8;
      }

      // ===== 5. CARD COLABORADOR =====
      box(18, y, 174, 20, C.card, 5);
      setDraw(C.gold);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(18, y, 174, 20, 5, 5, 'S');
      setColor(C.gold);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6);
      pdf.text('NOME DO COLABORADOR', 28, y + 6);
      setColor(C.white);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text(dados.nome.toUpperCase(), 28, y + 16);

      // Gold circle with "U"
      setFill(C.gold);
      pdf.circle(24, y + 10, 5, 'F');
      setColor(C.bg);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.text('U', 24, y + 11, { align: 'center' });

      y += 28;

      // ===== 6. SECAO TABELA =====
      setColor(C.gold);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('DETALHAMENTO DOS DIAS TRABALHADOS', 18, y);
      y += 8;

      // Cabe\u00e7alho tabela
      setColor(C.gold);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('DATA', 18, y);
      pdf.text('TURNO', 80, y);
      pdf.text('VALOR', 178, y, { align: 'right' });

      setDraw('#3A3A3C');
      pdf.setLineWidth(0.3);
      pdf.line(18, y + 1, 192, y + 1);
      y += 5;

      var count = 0;
      var linhasPorPag = 16;

      for (var i = 0; i < dados.turnos.length; i++) {
        var t = dados.turnos[i];

        if (count > 0 && count % linhasPorPag === 0) {
          pdf.addPage();
          fillBg();
          setColor(C.gold);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.text('DATA', 18, 16);
          pdf.text('TURNO', 80, 16);
          pdf.text('VALOR', 178, 16, { align: 'right' });
          setDraw('#3A3A3C');
          pdf.line(18, 17, 192, 17);
          y = 21;
        }

        var dt = formatarDataISO(t.data);
        var tNome = t.turno === 'manha' ? 'Manh\u00e3' : 'Noite';

        // Fundo zebrado
        if (count % 2 === 0) {
          setFill(C.card);
        } else {
          setFill(C.cardAlt);
        }
        pdf.rect(16, y - 1.5, 178, 6, 'F');

        setColor(C.white);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.text(dt, 18, y + 1.5);

        if (t.turno === 'manha') {
          setColor(C.gold);
        } else {
          setColor(C.blue);
        }
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.text(tNome, 80, y + 1.5);

        setColor(C.white);
        pdf.text('R$ ' + t.valor.toFixed(2).replace('.', ','), 178, y + 1.5, { align: 'right' });

        y += 6.5;
        count++;
      }

      y += 10;
      if (y > 235) { pdf.addPage(); fillBg(); y = 18; }

      // ===== 7. CARDS RESUMO =====
      var cw = 56, ch = 24, gap = 5, sx = 18;

      var cards = [
        { label: 'Total de Dias (Dia)', valor: '' + dados.dias_manha, cor: C.gold },
        { label: 'Total de Dias (Noite)', valor: '' + dados.dias_noite, cor: C.blue },
        { label: 'Valor Total a Receber', valor: 'R$ ' + dados.valor_total.toFixed(2).replace('.', ','), cor: C.gold, destaque: true }
      ];

      for (var ci = 0; ci < cards.length; ci++) {
        var cx = sx + ci * (cw + gap);

        if (cards[ci].destaque) {
          setFill(C.cardAlt);
          setDraw(C.gold);
          pdf.setLineWidth(0.6);
        } else {
          setFill(C.card);
          setDraw('#3A3A3C');
          pdf.setLineWidth(0.3);
        }
        pdf.roundedRect(cx, y, cw, ch, 5, 5, 'FD');

        setColor(C.gray);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(5.5);
        pdf.text(cards[ci].label, cx + 6, y + 6);

        pdf.setFont('helvetica', 'bold');
        if (cards[ci].destaque) {
          setColor(C.gold);
          pdf.setFontSize(12);
          pdf.text(cards[ci].valor, cx + 6, y + 18);
        } else {
          setColor(cards[ci].cor);
          pdf.setFontSize(16);
          pdf.text(cards[ci].valor, cx + 6, y + 17);
        }
      }

      y += 32;

      // ===== 8. ADIANTAMENTOS =====
      if (dados.adiantamento && dados.adiantamento > 0) {
        if (y > 245) { pdf.addPage(); fillBg(); y = 18; }

        var valorLiq = dados.valor_total - dados.adiantamento;

        // Adiantamentos line
        setFill(C.card);
        setDraw('#3A3A3C');
        pdf.roundedRect(18, y, 174, 9, 4, 4, 'FD');
        setColor(C.gray);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.text('Adiantamentos:', 24, y + 5.5);
        setColor('#FF6B6B');
        pdf.text('- R$ ' + dados.adiantamento.toFixed(2).replace('.', ','), 178, y + 5.5, { align: 'right' });
        y += 12;

        // Valor Liquido line
        setFill(C.cardAlt);
        setDraw(C.gold);
        pdf.setLineWidth(0.6);
        pdf.roundedRect(18, y, 174, 11, 4, 4, 'FD');
        setColor(C.gray);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.text('Valor L\u00edquido a Receber:', 24, y + 6.5);
        setColor(C.gold);
        pdf.setFontSize(12);
        pdf.text('R$ ' + valorLiq.toFixed(2).replace('.', ','), 178, y + 6.5, { align: 'right' });
        y += 16;
      }

      // ===== 9. MENSAGEM FINAL =====
      if (y > 260) { pdf.addPage(); fillBg(); y = 15; }

      box(18, y, 174, 14, C.footer, 5);
      setDraw('#3A3A3C');
      pdf.setLineWidth(0.3);
      pdf.roundedRect(18, y, 174, 14, 5, 5, 'S');

      setColor(C.gold);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('Agradecemos pelo seu compromisso e dedica\u00e7\u00e3o.', W / 2, y + 6, { align: 'center' });

      y += 20;

      // ===== 9. RODAP\u00c9 =====
      setColor(C.darkGray);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      pdf.text('LENA SERVI\u00c7OS  |  v' + APP_CONFIG.versao + '  |  ' + new Date().toLocaleString('pt-BR'), W / 2, y, { align: 'center' });

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
