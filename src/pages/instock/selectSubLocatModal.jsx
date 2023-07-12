import React from 'react';
import {Form} from 'antd';
import {ModalForm, ProFormSelect} from '@ant-design/pro-components';
import {matPackageInstock} from './service';
import {parseBaseResponse} from '../../utils/globalInfo';
export default (props) => {
  const {open, setOpen, reload, options, ids} = props;
  const [form] = Form.useForm();
  return (
    <ModalForm
      form={form}
      layout={'horizontal'}
      open={open}
      width={'30%'}
      modalProps={{
        onCancel: () => setOpen(false),
      }}
      title={'选择库位'}
      onFinish={async (formData) => {
        try {
          const v = await parseBaseResponse(matPackageInstock(ids, formData), {
            success: () => {
              reload();
              setOpen(false);
            },
          });
        } catch (e) {
          console.log('====================================');
          console.log(e);
          console.log('====================================');
        }
      }}
    >
      <ProFormSelect
        label={'类型'}
        name={'subLocat'}
        options={options}
        fieldProps={{
          bordered: false,
          fieldNames: {value: 'subLocatCode', label: 'subLocatName'},
        }}
      />
    </ModalForm>
  );
};
