import axios from 'axios';
import config from './config';
import dayjs from 'dayjs';
import crypto from 'crypto';

const apiURL = 'https://api.hbdm.com';
const { appkey, secret } = config.huobi;
const request = axios.create({
    baseURL: apiURL,
});
request.interceptors.request.use(axiosConfig => {
    const params = axiosConfig.params || {};
    Object.assign(params, {
        AccessKeyId: appkey,
        SignatureMethod: 'HmacSHA256',
        SignatureVersion: 2,
        Timestamp: dayjs().utc().format('YYYY-MM-DDThh:mm:ss'),
    })
    const requestParams = [
        axiosConfig.method.toLocaleUpperCase(),
        'api.hbdm.com',
        axiosConfig.url,
        Object.keys(params).sort((a, b) => a > b ? 1 : -1).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
    ].join('\n');
    
    const signature = crypto.createHmac("sha256", secret).update(requestParams, 'utf8').digest("base64");
    params.Signature = signature;
    axiosConfig.params = params;
    return axiosConfig;
})

request.interceptors.response.use(res => {
    if(res.data.status !== 'ok') {
        const error = new Error(res.data.err_msg);
        error.response = res;
        throw error;
    }
    return res.data.data;
})

export function getAccountInfo(symbol) {
    return request.post('/api/v1/contract_account_info', {
        symbol
    })
}

export function getPosition(symbol) {
    return request.post('/api/v1/contract_position_info', {
        symbol
    })
}

export function makeOrder(data) {
    return request.post('/api/v1/contract_order', data);
}

export function makeOrders(data) {
    return request.post('/api/v1/contract_batchorder', data);
}

export function getKlines(data) {
    return request.get('/market/history/kline', {
        params: data
    })
}

export function getConstracts(params) {
    return request.get('/api/v1/contract_contract_info', {
        params
    })
}

export function cancelAllOrders(params) {
    return request.post('/api/v1/contract_cancelall', params);
}