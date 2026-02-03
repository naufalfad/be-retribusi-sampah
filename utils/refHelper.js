const findOrCreateByName = async (Model, name, extraData = {}, transaction) => {
    if (!name) return null;

    const [data] = await Model.findOrCreate({
        where: { name },
        defaults: { name, ...extraData },
        transaction
    });

    return data;
};

module.exports = { findOrCreateByName };
