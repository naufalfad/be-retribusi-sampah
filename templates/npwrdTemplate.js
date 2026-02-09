const { formatTanggalID } = require('../utils/dateFormatter');

module.exports = function renderNpwrdHtml({ subjek, template }) {
    const isNonPribadi = subjek.kategori_subjek !== 'Pribadi';
    const tglTerbit = formatTanggalID(subjek.createdAt);

    // Logika Logo
    const logoUrl = template.logo
        ? `${process.env.API_BASE_URL}/${template.logo.replace(/\\/g, '/')}`
        : `${process.env.API_BASE_URL}/uploads/logo/logo-bogor.png`;

    return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: 85.6mm 53.98mm;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            background-color: #fff;
        }
        .card-container {
            width: 85.6mm;
            height: 53.98mm;
            position: relative;
            background: #e0e0e0; /* Warna dasar body kartu */
            overflow: hidden;
            border: 0.1mm solid #ccc;
            box-sizing: border-box;
        }
        /* Header warna emas/coklat khas kartu pajak */
        .header {
            background-color: #b38b1d;
            height: 14mm;
            width: 100%;
            display: flex;
            align-items: center;
            padding: 0 3mm;
            border-bottom: 0.8mm solid #8c6d12;
            color: #000;
            box-sizing: border-box;
        }
        .logo {
            width: 9mm;
            height: auto;
            margin-right: 2mm;
        }
        .uppercase-font {
            text-transform: uppercase;
        }
        .header-text {
            line-height: 1.1;
        }
        .header-text .pemda {
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        .header-text .dinas {
            font-size: 8.5pt;
            font-weight: black;
            text-transform: uppercase;
            letter-spacing: -0.2pt;
        }
        
        /* Area Konten */
        .content {
            padding: 2.5mm 4mm;
            font-size: 7.5pt;
            color: #000;
        }
        .npwrd-title {
            font-size: 9pt;
            font-weight: bold;
            margin-bottom: 1.5mm;
            display: block;
        }
        .npwrd-value {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11pt;
            font-weight: bold;
            letter-spacing: 0.5pt;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1mm;
        }
        td {
            padding: 0.3mm 0;
            vertical-align: top;
            font-size: 6.8pt;
            line-height: 1.1;
        }
        .label {
            width: 25mm;
            font-weight: bold;
            text-transform: uppercase;
        }
        .separator {
            width: 2mm;
        }
        
        /* Footer Card */
        .footer {
            position: absolute;
            bottom: 2mm;
            left: 4mm;
            right: 4mm;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 6pt;
        }
        .password-box {
            background: #fff;
            padding: 0.5mm 1.5mm;
            border: 0.1mm solid #999;
            font-family: monospace;
            font-weight: bold;
        }
        .date-box {
            text-align: right;
            font-weight: bold;
            text-transform: uppercase;
        }

        /* Background Pattern (Subtle Watermark) */
        .watermark {
            position: absolute;
            top: 20mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 40pt;
            color: rgba(0,0,0,0.03);
            font-weight: bold;
            white-space: nowrap;
            z-index: 0;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div class="card-container">
        <div class="watermark uppercase">${subjek.kategori_subjek}</div>

        <!-- HEADER -->
        <div class="header">
            <img src="${logoUrl}" class="logo" alt="Logo">
            <div class="header-text">
                <div class="pemda">${template.nama_pemda}</div>
                <div class="dinas">${template.dinas_pelaksana}</div>
            </div>
        </div>

        <!-- BODY -->
        <div class="content">
            <span class="npwrd-title">NPWRD : 
                <span class="npwrd-value">${subjek.npwrd_subjek}</span>
            </span>

            <table>
                <tr>
                    <td class="label">Nama</td>
                    <td class="separator">:</td>
                    <td style="font-weight: bold; text-transform: uppercase;">${subjek.nama_subjek}</td>
                </tr>
                
                ${isNonPribadi ? `
                <tr>
                    <td class="label">Penanggung Jawab</td>
                    <td class="separator">:</td>
                    <td style="text-transform: uppercase;">${subjek.penanggung_jawab_subjek || '-'}</td>
                </tr>
                <tr>
                    <td class="label">NPWP</td>
                    <td class="separator">:</td>
                    <td>${subjek.npwp_subjek || '-'}</td>
                </tr>
                ` : `
                <tr>
                    <td class="label">NIK</td>
                    <td class="separator">:</td>
                    <td>${subjek.nik_subjek}</td>
                </tr>
                `}

                <tr>
                    <td class="label">Alamat</td>
                    <td class="separator">:</td>
                    <td style="font-size: 6pt; text-transform: uppercase;">${subjek.alamat_subjek}</td>
                </tr>
                <tr>
                    <td class="label" style="color: #000; padding-top: 1mm;">Diterbitkan</td>
                    <td class="separator" style="padding-top: 1mm;">:</td>
                    <td style="font-size: 6pt; text-transform: uppercase;">${tglTerbit}</td>
                </tr>
            </table>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <div>
                <div style="margin-bottom: 0.5mm; color: #666; font-size: 5pt;">PASSWORD PORTAL:</div>
                <div class="password-box">${subjek.password_asli}</div>
            </div>
            <div class="uppercase-font" style="text-align: right; font-size: 5pt; font-weight: bold; opacity: 0.6;">
                REKAS DIGITAL CARD<br>${template.nama_pemda}
            </div>
        </div>
    </div>
</body>
</html>
    `;
};