'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ref_kecamatan', [
      { id: '1.1.01', id_kabupaten: '1.1', name: 'Babakan Madang', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.02', id_kabupaten: '1.1', name: 'Bojong Gede', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.03', id_kabupaten: '1.1', name: 'Caringin', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.04', id_kabupaten: '1.1', name: 'Cariu', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.05', id_kabupaten: '1.1', name: 'Ciampea', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.06', id_kabupaten: '1.1', name: 'Ciawi', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.07', id_kabupaten: '1.1', name: 'Cibinong', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.08', id_kabupaten: '1.1', name: 'Cibungbulang', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.09', id_kabupaten: '1.1', name: 'Cigombong', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.10', id_kabupaten: '1.1', name: 'Cigudeg', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.11', id_kabupaten: '1.1', name: 'Cijeruk', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.12', id_kabupaten: '1.1', name: 'Cileungsi', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.13', id_kabupaten: '1.1', name: 'Ciomas', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.14', id_kabupaten: '1.1', name: 'Cisarua', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.15', id_kabupaten: '1.1', name: 'Ciseeng', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.16', id_kabupaten: '1.1', name: 'Citeureup', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.17', id_kabupaten: '1.1', name: 'Dramaga', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.18', id_kabupaten: '1.1', name: 'Gunung Putri', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.19', id_kabupaten: '1.1', name: 'Gunung Sindur', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.20', id_kabupaten: '1.1', name: 'Jasinga', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.21', id_kabupaten: '1.1', name: 'Jonggol', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.22', id_kabupaten: '1.1', name: 'Kemang', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.23', id_kabupaten: '1.1', name: 'Klapanunggal', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.24', id_kabupaten: '1.1', name: 'Leuwiliang', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.25', id_kabupaten: '1.1', name: 'Leuwisadeng', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.26', id_kabupaten: '1.1', name: 'Megamendung', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.27', id_kabupaten: '1.1', name: 'Nanggung', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.28', id_kabupaten: '1.1', name: 'Pamijahan', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.29', id_kabupaten: '1.1', name: 'Parung', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.30', id_kabupaten: '1.1', name: 'Parung Panjang', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.31', id_kabupaten: '1.1', name: 'Ranca Bungur', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.32', id_kabupaten: '1.1', name: 'Rumpin', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.33', id_kabupaten: '1.1', name: 'Sukajaya', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.34', id_kabupaten: '1.1', name: 'Sukamakmur', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.35', id_kabupaten: '1.1', name: 'Sukaraja', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.36', id_kabupaten: '1.1', name: 'Tajurhalang', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.37', id_kabupaten: '1.1', name: 'Tamansari', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.38', id_kabupaten: '1.1', name: 'Tanjungsari', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.39', id_kabupaten: '1.1', name: 'Tenjo', createdAt: new Date(), updatedAt: new Date() },
      { id: '1.1.40', id_kabupaten: '1.1', name: 'Tenjolaya', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ref_kecamatan', null, {});
  }
};