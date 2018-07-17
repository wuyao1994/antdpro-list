import fetch from 'dva/fetch';
import { notification } from 'antd';
import AWS from 'aws-sdk';

AWS.config.update({
  region: 'us-east-2',
  accessKeyId: 'AKIAIR4N6UE4RVWIOJAQ',
  secretAccessKey: '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',
});
AWS.config.setPromisesDependency(Promise);

const docClient = new AWS.DynamoDB.DocumentClient();

function addItem(params) {
  const table = 'TEST_TABLE';
  const item = {
    TableName: table,
    Item: {
      ...params,
      time: new Date(),
    },
  };
  return docClient
    .put(item)
    .promise()
    .then(() => {
      return queryItems();
    })
    .catch(e => {
      const response = {
        err: e.name,
      };
      return response;
    });
}

function queryItems() {
  const query = {
    TableName: 'TEST_TABLE',
    Limit: 1000,
  };
  return docClient
    .scan(query)
    .promise()
    .then(data => {
      const response = {
        list: data.Items,
      };
      return response;
    })
    .catch(e => {
      const status = e.name;
      console.log(status);
      return e;
    });
}

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const errortext = codeMessage[response.status] || response.statusText;
  notification.error({
    message: `请求错误 ${response.status}: ${response.url}`,
    description: errortext,
  });
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
function request(url, options) {
  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
      newOptions.body = JSON.stringify(newOptions.body);
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
      };
    }
  }

  return fetch(url, newOptions)
    .then(checkStatus)
    .then(response => {
      if (newOptions.method === 'DELETE' || response.status === 204) {
        return response.text();
      }
      return response.json();
    })
    .catch(e => {
      const status = e.name;
      console.log(status);
    });
}

export { request, queryItems, addItem };
