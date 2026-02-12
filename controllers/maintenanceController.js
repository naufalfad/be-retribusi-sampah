const runOrphanCleaner = require('../utils/orphanCleaner');

exports.cleanOrphanFiles = async (req, res) => {
    try {
        const { dryRun } = req.body;

        const result = await runOrphanCleaner({
            dryRun: dryRun === true
        });

        return res.json({
            success: true,
            message: dryRun
                ? "Dry run completed"
                : "Orphan files cleaned successfully",
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to clean orphan files"
        });
    }
};