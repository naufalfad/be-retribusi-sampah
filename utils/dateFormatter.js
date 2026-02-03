exports.formatTanggalID = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

exports.formatTahun = (date) => {
    if (!date) return '-';
    return new Date(date).getFullYear();
};
