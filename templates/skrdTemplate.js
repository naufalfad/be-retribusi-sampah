const { formatTanggalID, formatTahun } = require('../utils/dateFormatter');

module.exports = function renderSkrdHtml({ skrd, template }) {
    const tahun = formatTahun(skrd.periode_tahun);
    const jatuhTempo = formatTanggalID(skrd.jatuh_tempo);
    const objek = skrd.Objek;
    const subjek = objek.Subjek;
    const kelas = objek.kelas;

    const pelayananList = [
        { nama: kelas?.pelayanan_1, tarif: kelas?.tarif_pelayanan_1 },
        { nama: kelas?.pelayanan_2, tarif: kelas?.tarif_pelayanan_2 },
        { nama: kelas?.pelayanan_3, tarif: kelas?.tarif_pelayanan_3 }
    ].filter(p => p.nama && p.tarif != null);

    const pelayananRows = pelayananList.map(p => `
        <tr>
            <td></td>
            <td style="padding-left:15px">${p.nama}</td>
            <td style="text-align:right">
                ${Number(p.tarif).toLocaleString('id-ID')},00
            </td>
        </tr>
    `).join('');

    const logoUrl = template.logo
        ? `${process.env.API_BASE_URL}/${template.logo.replace(/\\/g, '/')}`
        : `${process.env.API_BASE_URL}/uploads/logo/logo-bogor.png`;

    const ttdUrl = template.ttd_pejabat
        ? `${process.env.API_BASE_URL}/${template.ttd_pejabat.replace(/\\/g, '/')}`
        : `${process.env.API_BASE_URL}/logo-bogor.png`;

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>SKRD</title>
<style>
    @page {
        size: A4;
        margin: 20mm;
    }
    body {
        font-family: "Times New Roman", serif;
        font-size: 11px;
        color: #000;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th, td {
        border: 1px solid #000;
        padding: 5px;
        vertical-align: top;
    }
    .no-border td {
        border: none;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .uppercase { text-transform: uppercase; }
    .kop {
        border-bottom: 4px double #000;
        margin-bottom: 15px;
        padding-bottom: 10px;
    }
</style>
</head>
<body>

<!-- KOP SURAT -->
<table class="no-border kop">
<tr>
    <td width="80">
        <img src="${logoUrl}" width="70"/>
    </td>
    <td class="center">
        <div class="uppercase" style="font-weight:bold;font-size:16px">
            ${template.nama_pemda}
        </div>
        <div class="uppercase" style="font-weight:bold;font-size:14px">
            ${template.dinas_pelaksana}
        </div>
        <div style="font-size:10px">${template.alamat_pemda}</div>
        <div style="font-size:10px;text-decoration:underline;color:blue">
            ${template.website}
        </div>
    </td>
    <td width="140">
        <table>
            <tr><td class="center"><b><i>SKRD</i></b></td></tr>
            <tr><td>MASA : <b>${skrd.masa}</b></td></tr>
            <tr><td>TAHUN : <b>${tahun}</b></td></tr>
        </table>
    </td>
</tr>
</table>

<!-- NOMOR -->
<div style="text-align:right;margin-bottom:15px">
    <b>No. SKRD :</b> ${skrd.no_skrd || template.format_skrd}
</div>

<!-- IDENTITAS -->
<table class="no-border" style="margin-bottom:15px">
<tr><td width="160"><b>Nama Wajib Retribusi</b></td><td>:</td><td>${objek.nama_objek}</td></tr>
<tr><td><b>Alamat</b></td><td>:</td><td>${objek.alamat_objek}</td></tr>
<tr><td><b>NPWRD</b></td><td>:</td><td><b>${subjek.npwrd_subjek}</b></td></tr>
<tr><td><b>NPOR</b></td><td>:</td><td><b>${objek.npor_objek}</b></td></tr>
<tr><td><b>Jatuh Tempo</b></td><td>:</td><td>${jatuhTempo}</td></tr>
</table>

<!-- TABEL RINCIAN -->
<table>
<thead>
<tr>
    <th width="120">Kode Rekening</th>
    <th>Uraian Retribusi</th>
    <th width="160">Jumlah (Rp)</th>
</tr>
</thead>
<tbody>
<tr>
    <td>4.1.2.01.02</td>
    <td>Retribusi Pelayanan Persampahan/Kebersihan</td>
    <td class="right">
        ${Number(skrd.total_bayar).toLocaleString('id-ID')},00
    </td>
</tr>

${pelayananRows}

<tr>
    <td colspan="2" class="right"><b>Jumlah Ketetapan Pokok</b></td>
    <td class="right"><b>
        ${Number(objek.tarif_pokok_objek).toLocaleString('id-ID')},00
    </b></td>
</tr>
</tbody>
</table>

<!-- TANDA TANGAN -->
<table class="no-border" style="margin-top:30px">
<tr>
    <td width="60%" style="vertical-align:top">
        <b>Perhatian:</b><br/>
        1. Pembayaran dilakukan melalui kanal resmi Bank/QRIS.<br/>
        2. Keterlambatan dikenakan sanksi sesuai Perda.<br/>
        3. Simpan SKRD ini sebagai bukti sah.
    </td>

    <td class="center" style="vertical-align:top">
        Dicetak pada ${new Date().toLocaleDateString('id-ID')}<br/><br/>

        <!-- LOGO / TTD DIGITAL -->
        <img src="${ttdUrl}"
             alt="Tanda Tangan Pejabat"
             style="height:70px; object-fit:contain; margin-bottom:10px;" />

        <br/>

        <b class="uppercase">${template.jabatan_pejabat}</b><br/><br/>
        <u><b class="uppercase">${template.nama_pejabat}</b></u><br/>
        NIP. ${template.nip_pejabat}
    </td>
</tr>
</table>

</body>
</html>
`;
};
