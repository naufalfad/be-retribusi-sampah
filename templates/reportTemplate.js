module.exports = function renderReportHtml({ data, type, config, filterInfo }) {
    const tableRows = data.map((item, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td style="text-align: center;">${new Date(item.paid_at).toLocaleDateString('id-ID')}</td>
            <td>${item.no_ssrd}</td>
            <td>${item.Skrd?.no_skrd}</td>
            <td>
                <b>${item.Skrd?.Objek?.Subjek?.nama_subjek}</b><br/>
                <small>${item.Skrd?.Objek?.nama_objek}</small>
            </td>
            <td style="text-align: center;">
                ${item.Skrd?.Objek?.kelas?.nama_kelas || '-'} 
            </td>
            <td style="text-align: right;">${Number(item.amount_paid).toLocaleString('id-ID')}</td>
        </tr>
    `).join('');

    const totalPenerimaan = data.reduce((acc, curr) => acc + Number(curr.amount_paid), 0);

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        @page { size: A4 landscape; margin: 10mm; }
        body { font-family: Arial, sans-serif; font-size: 10px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .title { text-align: center; font-weight: bold; font-size: 14px; text-transform: uppercase; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 5px; }
        th { background: #f2f2f2; text-transform: uppercase; }
        .total-row { background: #e6f4ea; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h2 style="margin:0">${config.nama_pemda}</h2>
        <h3 style="margin:0">${config.dinas_pelaksana}</h3>
        <p style="margin:0; font-size: 9px;">${config.alamat_pemda}</p>
    </div>

    <div class="title">
        LAPORAN PENERIMAAN RETRIBUSI PELAYANAN PERSAMPAHAN (${type})<br/>
        PERIODE: ${filterInfo}
    </div>

    <table>
        <thead>
            <tr>
                <th width="30">No</th>
                <th width="80">Tgl Bayar</th>
                <th width="120">No. SSRD</th>
                <th width="120">No. SKRD</th>
                <th>Wajib Retribusi / Objek</th>
                <th width="120">Jenis / Kelas</th>
                <th width="100">Nominal (Rp)</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
            <tr class="total-row">
                <td colspan="6" style="text-align: right;">TOTAL PENERIMAAN</td>
                <td style="text-align: right;">Rp ${totalPenerimaan.toLocaleString('id-ID')}</td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 30px; float: right; width: 250px; text-align: center;">
        Cibinong, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
        <b>${config.jabatan_pejabat}</b><br/><br/><br/><br/>
        <u><b>${config.nama_pejabat}</b></u><br/>
        NIP. ${config.nip_pejabat}
    </div>
</body>
</html>
    `;
};