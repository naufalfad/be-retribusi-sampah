const fs = require("fs");
const path = require("path");
const { DokumenSubjek, DokumenObjek, RefDasarHukum } = require("../models");

const uploadsDir = path.join(__dirname, "../uploads");

async function runOrphanCleaner(options = { dryRun: false }) {
    try {
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
            ...subjekFiles.map(f => f.file_path && path.basename(f.file_path)),
            ...objekFiles.map(f => f.file_path && path.basename(f.file_path)),
            ...dasarHukumFiles.map(f => f.dokumen_peraturan && path.basename(f.dokumen_peraturan)),
        ]);

        const orphanFiles = allFiles.filter(file => !dbFiles.has(file));

        let deleted = 0;

        if (!options.dryRun) {
            for (const file of orphanFiles) {
                const filePath = path.join(uploadsDir, file);
                fs.unlinkSync(filePath);
                deleted++;
            }
        }

        return {
            success: true,
            total_files: allFiles.length,
            orphan_count: orphanFiles.length,
            deleted,
            orphan_files: orphanFiles
        };

    } catch (error) {
        console.error("Error in orphan cleaner:", error);
        throw error;
    }
}

module.exports = runOrphanCleaner;
