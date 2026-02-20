const { LogAktivitas } = require('../models');

/**
 * Helper untuk mencatat Audit Trail ke Database
 * @param {Object} req - Objek request dari Express
 * @param {Object} options - Detail log (action, module, description, data)
 */
const recordLog = async (req, { action, module, description, oldData = null, newData = null }) => {
    try {
        // Ambil info user dari middleware autentikasi (biasanya disimpan di req.user)
        const userId = req.user ? req.user.id_staff : null;
        const userRole = req.user ? req.user.role : 'GUEST';

        // Ambil IP Address (antisipasi jika lewat proxy/load balancer)
        const ip = req.headers['x-forwarded-for']
            ? req.headers['x-forwarded-for'].split(',')[0]
            : req.socket.remoteAddress;

        await LogAktivitas.create({
            id_user: userId,
            role: userRole,
            aksi: action,
            modul: module,
            deskripsi: description,
            data_lama: oldData,
            data_baru: newData,
            ip_address: ip,
            user_agent: req.headers['user-agent']
        });

        console.log(`[LOG]: ${action} oleh ${userRole} (ID: ${userId}) berhasil dicatat.`);
    } catch (error) {
        // Jangan sampai error di logger menghentikan transaksi utama, cukup catat di console
        console.error("Gagal mencatat log aktivitas:", error.message);
    }
};

module.exports = recordLog;