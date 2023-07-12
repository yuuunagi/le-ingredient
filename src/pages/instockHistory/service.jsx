import request from '../../utils/request';
export const matStockList = async (params) => {
  const d = await request.get('/api/matStock/list', {params});
  d.data = d.list;
  return d;
};
