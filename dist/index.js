"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
let tokenUpdater = null;
var tokenStatuses;
(function (tokenStatuses) {
    tokenStatuses[tokenStatuses["expired"] = 10] = "expired";
    tokenStatuses[tokenStatuses["bad"] = 11] = "bad";
    tokenStatuses[tokenStatuses["incorrect"] = 12] = "incorrect";
    tokenStatuses[tokenStatuses["revoked"] = 13] = "revoked";
    tokenStatuses[tokenStatuses["badSignature"] = 14] = "badSignature";
})(tokenStatuses || (tokenStatuses = {}));
const preRefreshPeriod = 10;
let refreshInstance;
let storage;
let axios;
let convertToCamelCase;
let globalConfig;
function configureAxiosJWTInterseptors(config) {
    if (storage && axios) {
        return;
    }
    storage = config.storage;
    axios = config.axios;
    convertToCamelCase = config.convertToCamelCase === undefined ? true : !!config.convertToCamelCase;
    globalConfig = config;
    refreshInstance = axios.create({
        timeout: (preRefreshPeriod / 2) * 1000
    });
    axios.interceptors.request.use((conf) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield refreshTokenIfNeeded(config);
        if (axios.defaults.headers.common['Authorization']) {
            conf.headers['Authorization'] = axios.defaults.headers.common['Authorization'];
        }
        return conf;
    }), (error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        throw error;
    }));
    axios.interceptors.response.use((response) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        return response;
    }), (error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const originalRequest = error.config;
        const needRefresh = error &&
            error.response &&
            error.response.status === 401 &&
            error.response.data &&
            error.response.data.code === tokenStatuses.expired;
        if (!needRefresh) {
            throw error;
        }
        try {
            yield refreshToken(config);
            return axios(originalRequest);
        }
        catch (e) {
            console.error(e);
            throw error;
        }
    }));
}
exports.configureAxiosJWTInterseptors = configureAxiosJWTInterseptors;
function refreshTokenIfNeeded(config) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { access, refresh } = yield getCreds();
        if (!access || !refresh) {
            return;
        }
        const refreshCamel = camelCase(refresh);
        const accessCamel = camelCase(access);
        if (!axios.defaults.headers.common['Authorization'] && access.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${access.token}`;
        }
        try {
            const now = Math.round(Date.now() / 1000);
            switch (true) {
                case refreshCamel.expiredAt < now:
                    break;
                case accessCamel.expiredAt < now:
                    yield refreshToken(config);
                    break;
                case accessCamel.expiredAt < now + preRefreshPeriod:
                    refreshToken(config);
                    break;
                default:
                    break;
            }
        }
        catch (e) {
            console.warn('refreshTokenIfNeeded');
        }
    });
}
function refreshToken(config) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { refresh } = yield getCreds();
        if (!refresh) {
            throw Error();
        }
        if (!tokenUpdater) {
            const refreshTokenKey = convertToCamelCase ? 'refreshToken' : 'refresh_token';
            delete refreshInstance.defaults.headers.common.Authorization;
            delete refreshInstance.defaults.headers.common.Authorization;
            tokenUpdater = refreshInstance
                .put(config.refreshTokenEndpoint, {
                [refreshTokenKey]: refresh.token
            }, {
                baseURL: axios.defaults.baseURL
            })
                .then((res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const creds = _getCredsFromRes(res, config);
                return yield saveCreds(creds);
            }))
                .catch((e) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield clearCreds();
                throw e;
            }))
                .finally(() => {
                tokenUpdater = null;
            });
        }
        return tokenUpdater;
    });
}
exports.refreshToken = refreshToken;
function saveCreds(creds) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!creds.access || !creds.access.token) {
            return;
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${creds.access.token}`;
        const preparedCreds = convertToCamelCase ? camelCase(creds) : creds;
        globalConfig && globalConfig.onSaveCreds && globalConfig.onSaveCreds(preparedCreds);
        return yield storage.setItem('creds', JSON.stringify(preparedCreds));
    });
}
exports.saveCreds = saveCreds;
function clearCreds() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        delete axios.defaults.headers.common['Authorization'];
        globalConfig && globalConfig.onClearCreds && globalConfig.onClearCreds();
        return yield storage.setItem('creds', '');
    });
}
exports.clearCreds = clearCreds;
function getCreds() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const credsItem = (storage && (yield storage.getItem('creds'))) || '{}';
            const creds = JSON.parse(credsItem);
            globalConfig && globalConfig.onGetCreds && globalConfig.onGetCreds(creds);
            return creds;
        }
        catch (e) {
            console.warn('Error at getCreds method!', e);
            return {};
        }
    });
}
exports.getCreds = getCreds;
function camelCase(obj) {
    let newObj = {};
    for (const d in obj) {
        if (obj.hasOwnProperty(d)) {
            const newKey = d.replace(/(\_\w)/g, function (m) {
                return m[1].toUpperCase();
            });
            newObj[newKey] = obj[d];
        }
    }
    return newObj;
}
function _getCredsFromRes(res, config) {
    if (config.getCredsFromRefreshResponse) {
        const result = config.getCredsFromRefreshResponse(res);
        if (result.access) {
            return result;
        }
        throw new Error('Function getCredsFromRefreshResponse wrong implemented. It should return data compatible with ICreds.');
    }
    if (res.data.access) {
        return res.data;
    }
    if (res.data.data.access) {
        return res.data.data;
    }
    throw new Error("Can't parse response to get tokens");
}
//# sourceMappingURL=index.js.map