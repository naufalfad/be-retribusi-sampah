const { formatTanggalID, formatTahun } = require('../utils/dateFormatter');
const { formatMasa } = require('../utils/monthFormatter');

module.exports = function renderSkrdHtml({ skrd, template }) {
    const tahun = formatTahun(skrd.periode_tahun);
    const jatuhTempo = formatTanggalID(skrd.jatuh_tempo);
    const labelMasa = formatMasa(skrd.periode_bulan, skrd.masa);

    const isKurangBayar = skrd.tipe_skrd === 'Kurang Bayar';

    const judulDokumen = isKurangBayar
        ? "SURAT KETETAPAN RETRIBUSI DAERAH KURANG BAYAR"
        : "SURAT KETETAPAN RETRIBUSI DAERAH";

    const singkatanDokumen = isKurangBayar ? "SKRDKB" : "SKRD";

    const objek = skrd.Objek;
    const subjek = objek.Subjek;
    const kelas = objek.kelas;
    const pelayananList = skrd.pelayanan || [];

    const pelayananRows = pelayananList.map(p => `
    <tr>
        <td></td>
        <td style="padding-left:15px">
            ${p.nama_pelayanan}
            ${p.volume ? `(${p.volume} m³)` : ''}
        </td>
        <td style="text-align:right">
            ${Number(p.sub_total).toLocaleString('id-ID')},00
        </td>
    </tr>
`).join('');

    const logoUrl = template.logo
        ? `${process.env.API_BASE_URL}/${template.logo.replace(/\\/g, '/')}`
        : `${process.env.API_BASE_URL}/uploads/logo/logo-bogor.png`;

    const ttdUrl = template.ttd_pejabat
        ? `${process.env.API_BASE_URL}/${template.ttd_pejabat.replace(/\\/g, '/')}`
        : `${process.env.API_BASE_URL}/${template.logo.replace(/\\/g, '/')}`;

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${singkatanDokumen}</title>
<style>
    @page {
        size: A4;
        margin: 20mm;
    }
    body {
        font-family: Arial, Helvetica, sans-serif;
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
            <tr><td class="center" style="font-weight:medium;font-size:13px" ><b>${singkatanDokumen}</b></td></tr>
            <tr><td>MASA : <b>${labelMasa}</b></td></tr>    
            <tr><td>TAHUN : <b>${skrd.periode_tahun}</b></td></tr>
        </table>
    </td>
</tr>
</table>

<div class="center uppercase" style="font-weight:bold; font-size:14px; margin-bottom:15px; text-decoration: none;">
    ${judulDokumen} (${singkatanDokumen})
</div>

<!-- NOMOR -->
<div style="text-align:right;margin-bottom:15px">
    <b>No. SKRD :</b> ${skrd.no_skrd || template.format_skrd}
</div>

<!-- IDENTITAS -->
<table class="no-border" style="margin-bottom:15px">
<tr><td width="160"><b>Nama Wajib Retribusi</b></td><td>:</td><td>${subjek.nama_subjek}</td></tr>
<tr><td width="160"><b>Klasifikasi Objek</b></td><td>:</td><td>${kelas.nama_kelas}</td></tr>
<tr><td width="160"><b>Nama Objek</b></td><td>:</td><td>${objek.nama_objek}</td></tr>
<tr><td><b>Alamat</b></td><td>:</td><td>${objek.alamat_objek}, ${objek.kelurahan_objek}</td></tr>
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
    <td>Retribusi Pelayanan Persampahan/Kebersihan (Tarif Pokok Retribusi)</td>
    <td class="right">
        ${Number(objek.tarif_pokok_objek).toLocaleString('id-ID')},00
    </td>
</tr>
<tr>
    <td></td>
    <td>Denda</td>
    <td class="right">
        ${Number(skrd.denda).toLocaleString('id-ID')},00
    </td>
</tr>

${pelayananRows}

<tr>
    <td colspan="2" class="right"><b>Jumlah Keseluruhan Retribusi</b></td>
    <td class="right"><b>
        ${Number(skrd.total_bayar).toLocaleString('id-ID')},00
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
        Cibinong, ${new Date().toLocaleDateString('id-ID')}<br/><br/>

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
