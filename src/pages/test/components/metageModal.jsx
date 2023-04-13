import React, {useState, forwardRef} from 'react';
import {Modal, Row, Col, Slider, InputNumber} from 'antd';
const MetageModal = (props, ref) => {
  const {open, setOpen, onOk, max, total} = props;
  const [value, setValue] = useState(Math.min(max, total));
  return (
    <Modal
      open={open}
      closable={false}
      onCancel={() => setOpen(false)}
      onOk={() => {
        onOk(value);
      }}
      title={`选择需要称量的重量`}
    >
      <span>{`总量: ${total}, 最大量程: ${max}`}</span>
      <Row>
        <Col span={12}>
          <Slider
            min={0}
            max={Math.min(max, total)}
            onChange={setValue}
            value={typeof value === 'number' ? value : 0}
            step={0.01}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            min={0}
            max={Math.min(max, total)}
            style={{margin: '0 16px'}}
            step={0.01}
            value={value}
            onChange={setValue}
          />
        </Col>
      </Row>
    </Modal>
  );
};
export default MetageModal;
