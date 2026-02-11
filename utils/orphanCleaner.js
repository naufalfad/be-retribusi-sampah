const fs = require("fs");
const path = require("path");
const { DokumenSubjek, DokumenObjek, RefDasarHukum } = require("../models");

const uploadsDir = path.join(__dirname, "../uploads");

async function runOrphanCleaner() {
    try {
        console.log("Running orphan file cleaner...");

        const allFiles = fs.readdirSync(uploadsDir);

        const subjekFiles = await DokumenSubjek.findAll({
            attributes: ["file_path"],
        });

        const objekFiles = await DokumenObjek.findAll({
            attributes: ["file_path"],
        });

        const dasarHukumFiles = await RefDasarHukum.findAll({
            attributes: ["dokumen_peraturan"],
        });

        const dbFiles = new Set([
            ...subjekFiles.map(f => path.basename(f.file_path)),
            ...objekFiles.map(f => path.basename(f.file_path)),
            ...dasarHukumFiles.map(f => path.basename(f.dokumen_peraturan)),
        ]);

        const orphanFiles = allFiles.filter(file => !dbFiles.has(file));

        for (const file of orphanFiles) {
            const filePath = path.join(uploadsDir, file);
            fs.unlinkSync(filePath);
            console.log(`Deleted orphan file: ${file}`);
        }

        console.log("Orphan cleaning completed");

    } catch (error) {
        console.error("Error in orphan cleaner:", error);
    }
}

module.exports = runOrphanCleaner;
