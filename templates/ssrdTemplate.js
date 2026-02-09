const { formatTanggalID, formatTahun } = require('../utils/dateFormatter');

module.exports = function renderSsrdHtml({ ssrd, skrd, template }) {
    const objek = skrd?.Objek || {};
    const subjek = objek?.Subjek || {};

    const tahun = skrd?.periode_tahun ? formatTahun(skrd.periode_tahun) : '-';
    const tanggalBayar = ssrd?.paid_at ? formatTanggalID(ssrd.paid_at) : '-';

    // Logika Logo dan TTD sesuai template SKRD Anda
    const logoUrl = template?.logo
        ? `${process.env.API_BASE_URL}/${template.logo.replace(/\\/g, '/')}`
        : `${process.env.API_BASE_URL}/uploads/logo/logo-bogor.png`;

    const ttdUrl = template?.ttd_pejabat
        ? `${process.env.API_BASE_URL}/${template.ttd_pejabat.replace(/\\/g, '/')}`
        : `${process.env.API_BASE_URL}/logo-bogor.png`;

    return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>SSRD - ${ssrd.no_ssrd}</title>
    <style>
        @page {
            size: A4;
            margin: 10mm;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            color: #000;
            line-height: 1.3;
        }
        .container {
            width: 100%;
            position: relative;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td {
            padding: 5px 8px;
            vertical-align: top;
            border: 1px solid #000;
        }
        .no-border td {
            border: none !important;
        }
        .header-title {
            text-align: center;
            font-weight: bold;
            font-size: 13px;
            text-transform: uppercase;
        }
        .dotted-line {
            border-bottom: 1px dotted #000;
            display: inline-block;
            width: 100%;
            min-height: 14px;
        }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        
        /* Watermark Lunas */
        .watermark {
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(0, 0, 0, 0.04);
            font-weight: bold;
            pointer-events: none;
            z-index: -1;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="watermark">LUNAS</div>

        <!-- HEADER BOX -->
        <table>
            <tr>
                <td width="15%" class="center">
                    <img src="${logoUrl}" width="55"/>
                </td>
                <td width="65%" class="header-title">
                    SURAT SETORAN RETRIBUSI DAERAH<br>(SSRD)
                </td>
                <td width="20%">
                    <b style="font-size: 12px">SSRD.</b><br>
                    <i style="font-size: 10px">${ssrd.no_ssrd}</i>
                </td>
            </tr>
        </table>

        <!-- DATA SECTION a s/d d -->
        <table style="border-top: none;">
            <tr>
                <td width="3%" style="border-right:none">a.</td>
                <td width="27%" style="border-left:none; border-right:none">Telah menerima uang sebesar</td>
                <td width="2%" style="border-left:none; border-right:none">:</td>
                <td style="border-left:none">
                    <span class="dotted-line"># <b>${ssrd.amount_paid || '-'}</b> #</span>
                </td>
            </tr>
            <tr>
                <td style="border-right:none">b.</td>
                <td style="border-left:none; border-right:none">Terbilang (Rupiah)</td>
                <td style="border-left:none; border-right:none">:</td>
                <td style="border-left:none">
                    <span class="dotted-line"><b>Rp. ${Number(ssrd.amount_paid).toLocaleString('id-ID')},00</b></span>
                </td>
            </tr>
            <tr>
                <td style="border-right:none">c.</td>
                <td style="border-left:none; border-right:none">Dari Nama (Objek / Subjek)</td>
                <td style="border-left:none; border-right:none">:</td>
                <td style="border-left:none">
                    <span class="dotted-line uppercase">${objek.nama_objek} / ${subjek.nama_subjek}</span>
                </td>
            </tr>
            <tr>
                <td style="border-right:none"></td>
                <td style="border-left:none; border-right:none">Alamat</td>
                <td style="border-left:none; border-right:none">:</td>
                <td style="border-left:none">
                    <span class="dotted-line">${objek.alamat_objek}</span>
                </td>
            </tr>
            <tr>
                <td style="border-right:none">d.</td>
                <td style="border-left:none; border-right:none">Sebagai Pembayaran</td>
                <td style="border-left:none; border-right:none">:</td>
                <td style="border-left:none">
                    <span class="dotted-line">Retribusi Pelayanan Persampahan/Kebersihan Masa ${skrd.masa} ${tahun}</span>
                </td>
            </tr>
        </table>

        <!-- TABLE REKENING -->
        <table style="border-top: none;">
            <tr style="background-color: #f9f9f9; font-weight:bold" class="center">
                <td width="40%" style="border-right: none;"></td>
                <td width="30%">Kode Rekening</td>
                <td width="30%">Jumlah (Rp)</td>
            </tr>
            <tr>
                <td style="border-right: none;"></td>
                <td class="center bold" style="font-size: 14px; padding: 10px;">4.1.2.01.02</td>
                <td class="center bold" style="font-size: 14px; padding: 10px;">
                    ${Number(ssrd.amount_paid).toLocaleString('id-ID')}
                </td>
            </tr>
        </table>

        <!-- INFO TANGGAL & SKRD -->
        <table style="border-top: none;">
            <tr>
                <td width="30%" style="border-right: none;">Tanggal Diterima Uang</td>
                <td width="2%" style="border-left: none; border-right: none;">:</td>
                <td style="border-left: none;">${tanggalBayar}</td>
            </tr>
            <tr>
                <td style="border-right: none;">Nomor SKRD</td>
                <td style="border-left: none; border-right: none;">:</td>
                <td style="border-left: none;">
                    <table class="no-border" style="width: 100%">
                        <tr>
                            <td style="padding:0">${skrd.no_skrd}</td>
                            <td style="padding:0" class="right">Tanggal Setor : ${tanggalBayar}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- TANDA TANGAN 3 KOLOM -->
        <table style="border-top: none;">
            <tr class="center bold" style="height: 30px;">
                <td width="33.3%">Pembantu Bendahara<br>Penerimaan Pembantu</td>
                <td width="33.3%">Juru Pungut</td>
                <td width="33.3%">Pembayar/Penyetor</td>
            </tr>
            <tr style="height: 60px;">
                <td></td>
                <td class="center" style="vertical-align: middle;">
                    <i style="color: #666; font-size: 8px;">Digital Signature Verified</i>
                </td>
                <td></td>
            </tr>
            <tr class="bold">
                <td>NIP. ........................................</td>
                <td>NIP. ........................................</td>
                <td class="center uppercase underline">${ssrd.atas_nama_pembayar || subjek.nama_subjek}</td>
            </tr>
        </table>

        <!-- TANDA TANGAN PEJABAT (DI LUAR KOTAK SESUAI REFERENSI) -->
        <div style="margin-top: 20px; float: right; width: 250px; text-align: center;">
            <p style="margin: 0; font-size: 11px;">${template.jabatan_pejabat},</p>
            <p style="margin: 5px 0; font-size: 10px; font-style: italic;">ttd.</p>
            
            <img src="${ttdUrl}" style="height: 60px; object-fit: contain; margin: 5px 0;" />
            
            <p style="margin: 0; font-weight: bold; text-decoration: underline; font-size: 12px;" class="uppercase">
                ${template.nama_pejabat}
            </p>
            <p style="margin: 0; font-size: 11px;">NIP. ${template.nip_pejabat}</p>
        </div>

        <div style="clear: both;"></div>
        
        <div style="margin-top: 20px; font-size: 9px; color: #555; font-style: italic;">
            * Dokumen ini merupakan salinan sah yang diterbitkan melalui Sistem SIRESIK.<br>
            * Dicetak otomatis pada: ${new Date().toLocaleString('id-ID')}
        </div>
    </div>
</body>
</html>
    `;
};