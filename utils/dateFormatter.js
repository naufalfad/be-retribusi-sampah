exports.formatTanggalID = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

exports.formatTanggalWaktuID = (date) => {
    if (!date) return '-';

    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';

        const tanggal = d.toLocaleDateString('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const jam = d.toLocaleTimeString('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/\./g, ':');

        return `${tanggal}, ${jam} WIB`;
    } catch {
        return '-';
    }
};

exports.formatTahun = (date) => {
    if (!date) return '-';
    return new Date(date).getFullYear();
};
