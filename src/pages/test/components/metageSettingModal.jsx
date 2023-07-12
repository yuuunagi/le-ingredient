import React, {useState, forwardRef} from 'react';
import {Form} from 'antd';
import Draggable from 'react-draggable';
import {
  ModalForm,
  ProFormText,
  ProFormSwitch,
  ProFormSelect,
  ProFormDigit,
  ProFormSlider,
} from '@ant-design/pro-components';
import {useEffect} from 'react';
import {metageUpdate} from '../service';
import {parseBaseResponse} from '../../../utils/globalInfo';
export default (props) => {
  const {open, setOpen, data, reload, options} = props;
  const [form] = Form.useForm();
  return (
    <ModalForm
      form={form}
      layout={'horizontal'}
      open={open}
      initialValues={data}
      width={'30%'}
      modalProps={{
        onCancel: () => setOpen(false),
        // modalRender: (modal) => (
        //   <Draggable handle=".modal-drag-title-shipping">{modal}</Draggable>
        // ),
      }}
      title={'参数设置'}
      onFinish={async (formData) => {
        try {
          const v = await parseBaseResponse(
            metageUpdate({id: data.id, ...formData}),
            {
              success: () => {
                reload();
                setOpen(false);
              },
            }
          );
        } catch (e) {
          console.log('====================================');
          console.log(e);
          console.log('====================================');
        }
      }}
    >
      <ProFormText label={'名称'} name={'name'} readonly />
      <ProFormSwitch label={'启用'} name={'isEnable'} />
      <ProFormSelect
        label={'类型'}
        name={'type'}
        options={options.map((x) => ({
          label: `${x.name}: ${x.max}`,
          value: x.value,
        }))}
      />
      {/* <ProFormDigit
        label="精度"
        name="input-number"
        min={0}
        max={1}
        fieldProps={{precision: 4}}
      /> */}
      {/* <ProFormDigit
        label={'最大量程'}
        min={1}
        max={50}
        name={'max'}
        fieldProps={{precision: 1}}
      /> */}
      <ProFormSlider label={'量程最大使用率'} name={'percentage'} />
    </ModalForm>
  );
};
