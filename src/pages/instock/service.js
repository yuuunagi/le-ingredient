import request from '../../utils/request';
export const baseInfoList = () => request.get('/api/matStock/baseInfo/list');
export const getSubLocatList = () => request.get('/api/matStock/subLocat/list');
export const inventoriesList = () =>
  request.get('/api/matStock/inventories/list');
export const save = (data) => request.post('/api/matStock/save', {data});
export const matPackageList = async (params) => {
  const d = await request.get('/api/matStock/matPackage/list', {params});
  d.data = d.list;
  return d;
};
export const matPackageInstock = (data, params) =>
  request.post('/api/matStock/matPackage/instock', {data, params});
export const matStockOne = (params) =>
  request.get('/api/matStock/one', {params});
