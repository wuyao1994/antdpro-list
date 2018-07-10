import { queryItems,addItem } from '../utils/request';


export async function queryList() {
  return queryItems();
}

export async function addList(params) {
  return addItem(params);
}

