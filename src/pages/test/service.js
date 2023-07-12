import request from '../../utils/request';
export const metageList = () => request.get('/openApi/metage/list');
export const metageRuleList = () => request.get('/openApi/metage/rule/list');
export const metageUpdate = (data) =>
  request.post('/openApi/metage/update', {data});
export const metageRuleListUpdate = (data) =>
  request.post('/openApi/metage/rule/listUpdate', {data});

export const matReqGetOne = (params) =>
  request.get('/api/matReq/getOne', {params});
