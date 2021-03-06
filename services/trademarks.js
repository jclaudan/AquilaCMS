const {Trademarks, Products} = require("../orm/models");
const QueryBuilder           = require('../utils/QueryBuilder');
const NSErrors               = require("../utils/errors/NSErrors");

const restrictedFields       = [];
const defaultFields          = ["_id", "name", "_slug"];
const queryBuilder           = new QueryBuilder(Trademarks, restrictedFields, defaultFields);

exports.getTrademarks = async function (PostBody) {
    return queryBuilder.find(PostBody);
};
exports.getTrademark = async function (PostBody) {
    return queryBuilder.findOne(PostBody);
};
exports.getTrademarkById = async function (id, PostBody = null) {
    return queryBuilder.findById(id, PostBody);
};

exports.saveTrademark = async function (req) {
    if (req.body._id) {
        const result = await Trademarks.findOneAndUpdate({_id: req.body._id}, req.body, {upsert: true, new: true});
        if (!result) return {status: false};
        return result;
    }
    const result = await new Trademarks({name: req.body.name}).save();
    if (!result) return {status: false};
    return result;
};

exports.deleteTrademark = async function (req) {
    const _trademark = await Trademarks.findOne({_id: req.params.id});
    if (!_trademark) throw NSErrors.TradeMarkNotFound;
    await Products.updateMany({}, {$unset: {trademark: {id: _trademark._id}}});
    const result = await Trademarks.deleteOne({_id: _trademark._id});
    return {status: !!result.ok};
};