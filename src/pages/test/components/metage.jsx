import React, {useState, forwardRef} from 'react';
import Icon from '@ant-design/icons';
import {Button, Card, Typography} from 'antd';
import {ReactComponent as MetageSvg} from '@/assets/metage.svg';
import {EllipsisOutlined, DeleteOutlined} from '@ant-design/icons';
import {find} from 'lodash';
const precisionMap = {
  1: 'kg',
  2: 'g',
};
const {Paragraph} = Typography;
const Metage = (props, ref) => {
  const {data, setOpen, options, reset, isDraggingOver} = props;
  const {name, value, target, task, isEnable, precision, type} = data;
  const rule = find(options, {value: type});
  return (
    <div>
      {!isEnable && <Card className="mask-div" />}
      <Card
        style={{
          textAlign: 'center',
          border: isDraggingOver ? 'medium dashed' : '',
        }}
      >
        <Icon
          component={MetageSvg}
          key="riskgroup"
          style={{fontSize: '32px'}}
        />
        <Paragraph>{name}</Paragraph>
        <Paragraph className="led">
          {value}
          {precisionMap[precision]}
        </Paragraph>
        <Paragraph>
          最大量程：{rule?.max}
          {precisionMap[precision]}
        </Paragraph>
        <Paragraph>当前任务: {task}</Paragraph>
        <Paragraph>
          目标重量：
          {target ? `${target}${precisionMap[precision]}` : null}
        </Paragraph>
        <div style={{position: 'absolute', right: 0, top: 0, zIndex: 101}}>
          <Button type="text" onClick={reset} icon={<DeleteOutlined />} />
          <Button
            type="text"
            onClick={() => {
              setOpen(true);
            }}
            icon={<EllipsisOutlined />}
          />
        </div>
      </Card>
    </div>
  );
};
export default forwardRef(Metage);
export {precisionMap};
