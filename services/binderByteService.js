const axios = require("axios");

const binderbyte = axios.create({
    baseURL: process.env.BINDERBYTE_BASE_URL,
    timeout: 10000,
    params: {
        api_key: process.env.BINDERBYTE_API_KEY
    }
});

const getProvinsi = async () => {
    const res = await binderbyte.get("/provinsi");
    return res.data;
};

const getKabupaten = async (provinsi_id) => {
    const res = await binderbyte.get("/kabupaten", {
        params: { id_provinsi: provinsi_id }
    });
    return res.data;
};

const getKecamatan = async (kabupaten_id) => {
    const res = await binderbyte.get("/kecamatan", {
        params: { id_kabupaten: kabupaten_id }
    });
    return res.data;
};

const getKelurahan = async (kecamatan_id) => {
    const res = await binderbyte.get("/kelurahan", {
        params: { id_kecamatan: kecamatan_id }
    });
    return res.data;
};

module.exports = {
    getProvinsi,
    getKabupaten,
    getKecamatan,
    getKelurahan
};