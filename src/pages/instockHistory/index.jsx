import {ProTable} from '@ant-design/pro-components';
import {matStockList} from './service';
import {useNavigate} from 'react-router-dom';
export default (props) => {
  const history = useNavigate();
  const columns = [
    {title: '入库单号', dataIndex: 'instockNo'},
    {title: '创建人', dataIndex: 'createBy'},
    {title: '创建时间', dataIndex: 'createTime'},
    {
      title: '操作',
      key: 'action',
      render: (_) => (
        <a onClick={() => history('/instock', {state: {id: _.id, type: 2}})}>
          详情
        </a>
      ),
    },
  ];
  return (
    <ProTable
      size="small"
      columns={columns}
      bordered={true}
      options={false}
      search={true}
      rowKey={'id'}
      request={(params, sort, filter) => matStockList({...params, ...filter})}
    />
  );
};
