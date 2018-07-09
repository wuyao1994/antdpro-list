import { stringify } from 'qs';
import { request, queryItems } from '../utils/request';


export async function queryRule(params) {
  // return request(`/api/rule?${stringify(params)}`);
  return queryItems();
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

