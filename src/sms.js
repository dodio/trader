const axios = require('axios');
const request = axios.create({
  baseURL: 'http://yzx.market.alicloudapi.com',
  headers: {
    Authorization: 'APPCODE 82de53ad5c994cb08e8d2cda1c2146d3'
  }
})

const errorCodeMessage = {
  '10000': '参数异常',
  '10001': '手机号格式不正确',
  '10002': '模板不存在',
  '10003': '模板变量不正确',
  '10004': '变量中含有敏感词',
  '10005': '变量名称不匹配',
  '10006': '短信长度过长',
  '10007': '手机号查询不到归属地',
  '10008': '产品错误',
  '10009': '价格错误',
  '10010': '重复调用',
  '99999': '系统错误',
};

request.interceptors.response.use(function (res) {
  if (res.data && res.data.return_code === '000000') {
    return res.data;
  }
  const error = new Error(errorCodeMessage[res.data.return_code] || '未知错误');
  error.response = res;
  throw error;
})

export function sendSMS(tpid, mobile, params) {
  return request.post('/yzx/sendSms', '', {
    params: {
      mobile,
      param: typeof params === 'string' ? params : Object.keys(params)
        .map(key => [key, params[key]].join(':')).join(','),
      tpl_id: tpid
    }
  });
}