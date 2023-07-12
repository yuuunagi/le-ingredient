import {Form, Card, Divider, Button, Space} from 'antd';
import {
  ProForm,
  ProFormText,
  ProTable,
  ProFormSelect,
  ProFormCheckbox,
  ProFormCascader,
  ProFormDigit,
} from '@ant-design/pro-components';
import {
  baseInfoList,
  inventoriesList,
  save,
  getSubLocatList,
  matPackageList,
  matStockOne,
} from './service';
import {useState, useEffect, useRef} from 'react';
import {parseBaseResponse} from '../../utils/globalInfo';
import {useLocation} from 'react-router-dom';
import SelectSubLocatModal from './selectSubLocatModal';
import {fs, shell, path} from '@tauri-apps/api';
const globalWidth = {width: 'sm', fieldProps: {bordered: false}};
const grades = [
  {value: 'A', label: 'A'},
  {value: 'B', label: 'B'},
  {value: 'Z', label: '精砂'},
];
const matArts = [
  {value: 'proDeiron', label: '除铁'},
  {value: 'proSieved', label: '过筛'},
  {value: 'proPremix', label: '预混'},
  {value: 'colorSelection', label: '色选'},
];

//treeData树节点 level上级层级 path上级路径
const addName = (treeData, level, path, map) => {
  //如果传进来的参数不是数组返回false
  if (!Array.isArray(treeData)) return;
  return treeData.filter((item, index) => {
    //给每一级添加level
    item['level'] = level ? level++ : 1;
    item['label'] = item['vName'];
    item['value'] = item['id'];
    //给每一级添加路径
    item['path'] = path ? path + ',' + item['id'] : item['id'] + '';
    if (item.children && item.children.length !== 0) {
      return addName(item.children, item.level, item.path, map);
    } else {
      map[item.id] = item.path;
    }
  });
};

export default (props) => {
  const location = useLocation();
  const {id: propsId, type = 1} = location?.state || {};
  const readonly = type == 2;
  const [id, setId] = useState(propsId);
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [ids, setIds] = useState([]);
  const [ivList, setIvList] = useState([]);
  const [sList, setSList] = useState([]);
  const [treeList, setTreeList] = useState([]);
  const [l5, setL5] = useState([]);
  const [itemClassId, setItemClassId] = useState([]);
  const [fullName, setFullName] = useState();
  const [idMap, setIdMap] = useState({});
  const [subLocatList, setSubLocatList] = useState([]);
  const tableRef = useRef();
  const columns = [
    {title: '序号', dataIndex: 'indexId'},
    {title: '料包条码', dataIndex: 'matPackageNo'},
    {title: '库位', dataIndex: 'subLocatName'},
    {
      title: '操作',
      key: 'action',
      render: (_) => (
        <a
          onClick={async () => {
            const resourcePath = await path.resolveResource(
              'configs/template.prn'
            );
            let data = await fs.readTextFile(resourcePath);
            data = data
              .replace('{id}', _.matPackageNo)
              .replace('{label}', _.matPackageNo);
            await fs.writeFile({
              path: '\\\\localhost\\T-4502E',
              contents: data,
            });
          }}
        >
          打印条码
        </a>
      ),
    },
  ];
  useEffect(() => {
    getSubLocatList().then((res) => {
      setSubLocatList(res.list || []);
    });
    if (type == 1) {
      inventoriesList().then((res) => {
        init(res.list);
      });
      baseInfoList().then((res) => {
        setSList(res.list || []);
        const temp = res.map || {};
        if (temp.children) {
          temp.children = temp.children.filter(
            (x) => x.name == 'Y' || x.name == 'C'
          );
          const map = {};
          setTreeList(addName(temp.children, undefined, undefined, map));
          setIdMap(map);
        }
      });
    } else if (type == 2) {
      matStockOne({id}).then(({data, detail}) => {
        form.setFieldsValue({
          ...data,
          matId: detail?.inventoryNumber,
          fullName: detail?.fullName,
          supplier: detail?.supplier,
          itemClass: detail?.itemClass,
        });
      });
    }
  }, []);
  const init = (list) => {
    const s = {};
    setIvList(
      (list || []).map((x) => {
        if (!s[x.fullName]) {
          s[x.fullName] = [];
        }
        const itemClassId = x.materialCategory.substr(3);
        s[x.fullName].push(itemClassId);
        return {
          label: x.inventoryNumber,
          value: x.rowNumber,
          key: x.rowNumber,
          itemClassId,
          ...x,
        };
      })
    );
    setL5(
      Object.keys(s).map((x) => ({
        label: x,
        value: x,
        itemClassId: s[x],
      }))
    );
  };
  useEffect(() => {
    tableRef?.current?.reload();
  }, [id]);
  return (
    <>
      <ProForm
        form={form}
        layout="horizontal"
        prefixCls="f1"
        submitter={false}
        style={{paddingInline: 24}}
        readonly={readonly}
        onFinish={async (formData) => {
          try {
            const v = await parseBaseResponse(save(formData), {
              success: ({data}) => {
                form.setFieldValue('instockNo', data.instockNo);
                setId(data.id);
              },
            });
          } catch (e) {
            console.log(e);
          }
        }}
      >
        <ProForm.Group>
          <ProFormSelect
            label={'物料编码'}
            name={'matId'}
            {...globalWidth}
            options={
              !fullName && !itemClassId?.length
                ? ivList
                : !itemClassId?.length
                ? ivList.filter((x) => x.fullName == fullName)
                : !fullName
                ? ivList.filter(
                    (x) => x.itemClassId == itemClassId[itemClassId.length - 1]
                  )
                : ivList.filter(
                    (x) =>
                      x.itemClassId == itemClassId[itemClassId.length - 1] &&
                      x.fullName == fullName
                  )
            }
            showSearch
            fieldProps={{
              bordered: false,
              onChange: (v, s) => {
                if (idMap[s.itemClassId]) {
                  setItemClassId(
                    idMap[s.itemClassId].split(',').map((x) => parseInt(x))
                  );
                }
                form.setFieldValue('supplier', parseInt(s.supplier));
                form.setFieldValue('fullName', s.fullName);
              },
            }}
          />
          <ProFormText
            name={'instockNo'}
            label={'入库单'}
            {...globalWidth}
            readonly
          />
          <ProFormText
            name={'userName'}
            label={'当前用户'}
            initialValue={'OA'}
            {...globalWidth}
            readonly
          />
        </ProForm.Group>
        <Divider orientation="left">原料属性</Divider>
        {readonly ? (
          <ProFormText name="itemClass" label="原料分类" width="md" />
        ) : (
          <ProFormCascader
            name="itemClassId"
            label="原料分类"
            width="md"
            value={itemClassId}
            fieldProps={{
              bordered: false,
              options: treeList,
              onChange: (v, s) => {
                setItemClassId(v);
                form.setFieldValue('matId', undefined);
                form.setFieldValue('fullName', undefined);
              },
            }}
          />
        )}
        <ProFormSelect
          name={'fullName'}
          label={'存货全名'}
          {...globalWidth}
          options={
            !itemClassId?.length
              ? l5
              : l5.filter((x) => {
                  return x.itemClassId.includes(
                    itemClassId[itemClassId.length - 1] + ''
                  );
                })
          }
          fieldProps={{
            bordered: false,
            onChange: (v, s) => {
              setFullName(v);
            },
          }}
        />
        <ProFormSelect
          name={'supplier'}
          label={'供应商'}
          {...globalWidth}
          readonly
          options={sList}
          fieldProps={{
            fieldNames: {value: 'id', label: 'name'},
          }}
        />
        <Divider orientation="left">质检属性</Divider>
        <ProFormSelect
          name={'grade'}
          label={'评级'}
          {...globalWidth}
          options={grades}
        />
        <ProFormText name={'batch'} label={'班次/批次'} {...globalWidth} />

        <ProForm.Group>
          {matArts.map((x) => (
            <ProFormDigit
              key={x.value}
              label={x.label}
              name={x.value}
              width={'xs'}
              fieldProps={{
                bordered: false,
                controls: false,
              }}
            />
          ))}
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText name={'pValue'} label={'P'} {...globalWidth} />
          <ProFormText name={'dValue'} label={'D'} {...globalWidth} />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText name={'graValue'} label={'粒度值'} {...globalWidth} />
          <ProFormText
            name={'inspectBy'}
            label={'检测员'}
            {...globalWidth}
            required
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormDigit
            label={'单包重量'}
            name={'perWeight'}
            {...globalWidth}
            required
            fieldProps={{
              bordered: false,
              controls: false,
            }}
          />
          <ProFormDigit
            label={'数量'}
            required
            name={'totalPack'}
            {...globalWidth}
            fieldProps={{
              bordered: false,
              controls: false,
            }}
          />
          {/* <ProFormSelect
            name={'subLocat'}
            label={'位置'}
            {...globalWidth}
            options={subLocatList}
            fieldProps={{
              bordered: false,
              fieldNames: {value: 'subLocatCode', label: 'subLocatName'},
            }}
          /> */}
          {!readonly && (
            <Button type="primary" onClick={form.submit}>
              生成条码
            </Button>
          )}
        </ProForm.Group>
      </ProForm>

      <ProTable
        size="small"
        actionRef={tableRef}
        rowSelection={{
          getCheckboxProps: (_) => ({disabled: _.subLocat}),
        }}
        tableAlertOptionRender={({
          selectedRowKeys,
          selectedRows,
          onCleanSelected,
        }) => (
          <Space>
            <a
              onClick={() => {
                setModalOpen(true);
                setIds(selectedRowKeys);
              }}
            >
              加入库位
            </a>
            <a onClick={onCleanSelected}>取消</a>
          </Space>
        )}
        columns={columns}
        bordered={true}
        options={false}
        search={false}
        request={() => (id ? matPackageList({id: id}) : {})}
        rowKey={'id'}
      />
      <SelectSubLocatModal
        options={subLocatList}
        open={modalOpen}
        setOpen={setModalOpen}
        reload={() => {
          tableRef?.current?.reload();
          tableRef?.current?.clearSelected();
        }}
        ids={ids}
      />
    </>
  );
};
