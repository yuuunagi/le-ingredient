import React, {useState, forwardRef} from 'react';
import {Form} from 'antd';
import Draggable from 'react-draggable';
import {
  ProForm,
  ModalForm,
  ProFormText,
  ProFormSwitch,
  ProFormSelect,
  ProFormDigit,
  ProFormSlider,
  ProFormDigitRange,
  ProFormList,
} from '@ant-design/pro-components';
import {metageRuleListUpdate} from '../service';
import {parseBaseResponse} from '../../../utils/globalInfo';

export default (props) => {
  const {open, setOpen, data, reload} = props;
  const d = data.filter((x) => x.type == '01');
  const [form] = Form.useForm();
  console.log(data);
  return (
    <ModalForm
      form={form}
      layout={'horizontal'}
      visible={open}
      width={'50%'}
      initialValues={data}
      modalProps={{
        onCancel: () => setOpen(false),
        // modalRender: (modal) => (
        //   <Draggable handle=".modal-drag-title-shipping">{modal}</Draggable>
        // ),
      }}
      title={'规则设置'}
      onFinish={async (formData) => {
        try {
          const v = await parseBaseResponse(
            metageRuleListUpdate(
              formData.rules.map((x) => ({
                ...x,
                startValue: x.useRange[0],
                endValue: x.useRange[1],
              }))
            ),
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
      <ProFormList
        name="rules"
        initialValue={d}
        alwaysShowItemLabel={true}
        actionRender={() => []}
        creatorRecord={() => {
          const i = parseInt(d[d.length - 1].value);
          let s = `0${i + 1}`;
          s = s.substring(s.length - 2, s.length);
          return {name: '色粉称' + s, type: '01', value: s};
        }}
      >
        <ProForm.Group>
          <ProFormText readonly={true} name="name" label={'类型'} width="xs" />
          <ProFormDigit
            label={'最大量程'}
            min={1}
            max={50}
            name={'max'}
            fieldProps={{precision: 3}}
            width="xs"
          />
          <ProFormDigitRange
            label="适用范围"
            name="useRange"
            width="xs"
            fieldProps={{controls: false, precision: 3}}
          />
        </ProForm.Group>
      </ProFormList>
    </ModalForm>
  );
};
