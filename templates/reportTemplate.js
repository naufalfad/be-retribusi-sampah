module.exports = function renderReportHtml({ data, type, config, filterInfo }) {
    const tableRows = data.map((item, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${item.no_skrd || '-'}</td>
            <td>${item.Objek?.Subjek?.npwrd_subjek || '-'}</td>
            <td>${item.Objek?.nama_objek || item.nama_subjek}</td>
            <td style="text-align: right;">${Number(item.total_bayar || 0).toLocaleString('id-ID')}</td>
            <td style="text-align: center;">${item.status === 'paid' ? 'LUNAS' : 'PIUTANG'}</td>
        </tr>
    `).join('');

    const totalNominal = data.reduce((acc, curr) => acc + Number(curr.total_bayar || 0), 0);

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: "Times New Roman", serif; font-size: 11px; color: #000; }
        .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
        .title { text-align: center; text-transform: uppercase; font-weight: bold; font-size: 14px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 6px; vertical-align: middle; }
        th { background-color: #f2f2f2; text-transform: uppercase; font-size: 10px; }
        .footer-table { border: none !important; margin-top: 30px; }
        .footer-table td { border: none !important; }
        .summary-box { background: #f9f9f9; padding: 10px; border: 1px solid #000; width: 300px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h2 style="margin:0">${config.nama_pemda}</h2>
        <h3 style="margin:0">${config.dinas_pelaksana}</h3>
        <p style="margin:0; font-size: 10px;">${config.alamat_pemda}</p>
    </div>

    <div class="title">
        LAPORAN ${type.replace('_', ' ')} RETRIBUSI PELAYANAN PERSAMPAHAN<br>
        PERIODE: ${filterInfo}
    </div>

    <div class="summary-box">
        <b>RINGKASAN LAPORAN:</b><br>
        Total Transaksi: ${data.length} Data<br>
        Total Penerimaan: Rp. ${totalNominal.toLocaleString('id-ID')}
    </div>

    <table>
        <thead>
            <tr>
                <th width="30">No</th>
                <th width="150">Nomor SKRD</th>
                <th width="120">NPWRD</th>
                <th>Nama Wajib Retribusi / Objek</th>
                <th width="130">Nominal (Rp)</th>
                <th width="80">Status</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>

    <table class="footer-table">
        <tr>
            <td width="70%"></td>
            <td style="text-align: center;">
                Cibinong, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
                <b>${config.jabatan_pejabat}</b><br><br><br><br><br>
                <u><b>${config.nama_pejabat}</b></u><br>
                NIP. ${config.nip_pejabat}
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};