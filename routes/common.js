const {authentication, adminAuth} = require("../middleware/authentication");
const {middlewareServer}          = require('../middleware');
const servicesCommon              = require('../services/common');

module.exports = function (app) {
    app.post('/cookienotice', setCookieNotice);
    app.get('/serverIsUp', serverIsUp);
    app.post("/v2/getBreadcrumb", getBreadcrumb);
    app.get("/v2/export/csv/:model",  authentication, adminAuth, exportData);
    app.post("/v2/export/csv/:model", authentication, adminAuth, exportData);

    // Deprecated
    app.post("/v2/calculStock", middlewareServer.deprecatedRoute, calculStock);
};

function setCookieNotice(req, res, next) {
    try {
        const cookie = req.cookies.cookie_notice;
        if (cookie !== undefined) {
            const expDate = new Date();
            expDate.setMonth(expDate.getMonth() + 3);
            res.cookie('cookie_notice', req.body.value, {expires: expDate, httpOnly: false});
        }
        return res.end();
    } catch (err) {
        return next(err);
    }
}

const serverIsUp = (req, res) => {
    return res.status(200).end();
};

/**
 * Fonction retournant le breadcrumb
 */
async function getBreadcrumb(req, res, next) {
    try {
        const result = await servicesCommon.getBreadcrumb(req.body.url);
        return res.json(result);
    } catch (error) {
        return next(error);
    }
}

/**
 * Export data
 */
async function exportData(req, res, next) {
    try {
        const result = await servicesCommon.exportData(req.params.model, req.body.PostBody);
        return res.json(result);
    } catch (error) {
        return next(error);
    }
}

//= ====================================================================
//= ========================== Deprecated ==============================
//= ====================================================================

/**
 * Fonction permettant de calculer les informations de stock pour les thèmes
 * @deprecated
 */
async function calculStock(req, res, next) {
    try {
        const result = await require("../services/products").calculStock(req.body);
        return res.json(result);
    } catch (error) {
        return next(error);
    }
}