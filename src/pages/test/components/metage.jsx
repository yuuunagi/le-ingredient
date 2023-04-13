import React, {useState, forwardRef} from 'react';
import Icon from '@ant-design/icons';
import {Card} from 'antd';
import {ReactComponent as MetageSvg} from '@/assets/metage.svg';
const precisionMap = {
  1: 'kg',
  2: 'g',
};
const Metage = (props, ref) => {
  const {name, value, target, task, isDraggingOver, max, precision} = props;
  return (
    <Card
      style={{
        textAlign: 'center',
        border: isDraggingOver ? 'medium dashed' : '',
      }}
    >
      <Icon component={MetageSvg} key="riskgroup" style={{fontSize: '32px'}} />
      <p>{name}</p>
      <p>
        读数：{value}
        {precisionMap[precision]}
      </p>
      <p>
        最大量程：{max.toFixed(2)}
        {precisionMap[precision]}
      </p>
      <p>当前任务: {task}</p>
      <p>
        目标重量：
        {target ? `${target.toFixed(2)}${precisionMap[precision]}` : null}
      </p>
    </Card>
  );
};
export default forwardRef(Metage);
export {precisionMap};
