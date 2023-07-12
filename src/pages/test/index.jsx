import {useState, useEffect} from 'react';
import {Droppable, Draggable, DragDropContext} from '@hello-pangea/dnd';
import {Row, Col, Card, notification, Space, Button, Input} from 'antd';
import Metage, {precisionMap} from './components/metage';
import MetageModal from './components/metageModal';
import MetageSettingModal from './components/metageSettingModal';
import MetageRuleModal from './components/metageRuleModal';
import {invoke} from '@tauri-apps/api/tauri';
import {find, set} from 'lodash';
import BigDecimal from 'decimal.js';
import {useMount} from 'ahooks';
import {metageList, metageRuleList, matReqGetOne} from './service';
import {useTranslation} from 'react-i18next';
function str2ArrayBuffer(bytes, len) {
  var buf = new ArrayBuffer(len);
  var bufView = new Uint8Array(buf);
  for (var i = 0; i < bytes.length; i++) {
    bufView[i] = bytes[i];
  }
  return buf;
}
// 将4个字节型字符串转为Float
function convertFloat(bytes) {
  var buffer = str2ArrayBuffer(bytes, 4);
  var dataView = new DataView(buffer, 0, 4);
  return dataView.getFloat32(0).toFixed(3);
}
// IEEE754
function float2hex(numStr = '0') {
  let buf = new ArrayBuffer(4); // 创建一个4字节的二进制数据缓冲区
  let view = new DataView(buf); // 创建一个数据视图
  view.setFloat32(0, parseFloat(numStr), false); // 在偏移量为0的位置写入0.01，使用大端字节序
  let hex = [...new Uint8Array(buf)] // 创建一个8位无符号整数数组，并将其展开为一个普通数组
    .map((b) => b.toString(16).padStart(2, '0')) // 将每个字节转换为16进制字符串，并用0补齐两位
    .join(''); // 将所有的16进制字符串拼接成一个完整的字符串
  return hex;
}
const deviation = float2hex('0.001');
let t = null;
export default (props) => {
  const {t, i18n} = useTranslation();
  const matTypeMap = t('matTypeMap', {returnObjects: true});
  const matReqTypeMap = t('matReqTypeMap', {returnObjects: true});
  const [rules, setRules] = useState([]);
  const [metages, setMetages] = useState([]);
  const reloadMetages = () => {
    metageList().then(({success, list}) => {
      setMetages(list.map((x) => ({...x, value: '0.000'})));
    });
  };
  const reloadRules = () => {
    metageRuleList().then(({success, list}) => {
      setRules(list.map((x) => ({...x, useRange: [x.startValue, x.endValue]})));
    });
  };
  const [task, setTask] = useState();
  const [taskDetail, setTaskDetail] = useState([]);
  const [metageModalOpen, setMetageModalOpen] = useState(false);
  const [metageSettingModalOpen, setMetageSettingModalOpen] = useState(false);
  const [metageRuleModalOpen, setMetageRuleModalOpen] = useState(false);
  const [currentTaskDetail, setCurrentTaskDetail] = useState(-1);
  const [currentMetage, setCurrentMetage] = useState(-1);
  const [status, setStatus] = useState(0);
  useMount(() => {
    reloadMetages();
    reloadRules();
    // invoke('socket_connect', { addr: '192.168.0.1:2000' }).then(res=>{
    //   if('Connected successfully' == res || 'Already connected' == res){
    //     clearInterval(t)
    //     t = setInterval(() => {
    //       invoke('socket_read').then(res=>{
    //         if(!res) return
    //         const v1 = convertFloat(res.slice(0, 4));
    //         const v2 = convertFloat(res.slice(6, 10));
    //         if(metages[0].value != v1 || metages[1].value != v2 ){
    //           metages[0].value = v1
    //           metages[1].value = v2
    //           setMetages([...metages])
    //         }
    //       }).catch(err=>{
    //         notification.error({message: err.toString()})
    //       })
    //     }, 1000);
    //   } else {
    //     notification.error({message: res})
    //   }
    // }).catch(err=>{
    //   notification.error({message: err.toString()})
    // })
  });
  const startTask = () => {
    invoke('socket_write', {
      message: `0000${float2hex(metages[0].target)}${deviation}0100${float2hex(
        metages[1].target
      )}${deviation}0100`,
    });
    setStatus(1);
  };
  const onInputChange = (e) => {
    if (e.target.value.length == 32)
      matReqGetOne({id: e.target.value, detail: true}).then(
        ({success, data, list}) => {
          setTask(data);
          setTaskDetail(
            list.map((x) => {
              const {matName, matOrigin, matSpec, matType} = x.matAttr;
              if (matType != '3') {
                x.weight = BigDecimal(x.weight).div(1000).toFixed(3);
              }
              return {
                id: x.id,
                matName: `${matName}${matSpec}${matTypeMap[matType]}`,
                matOrigin,
                status: 0,
                matSpec,
                matType,
                weight: x.weight,
                remWeight: x.weight,
                precision: 1,
              };
            })
          );
        }
      );
  };
  const divideTasks = () => {
    taskDetail.forEach((x, index) => {
      findMetage(x, x.matType == '3' ? '11' : undefined, index);
    });
    setMetages([...metages]);
    setTaskDetail([...taskDetail]);
  };

  const findMetage = (reqDetail, type, targetIndex) => {
    const task = `${reqDetail.matName}`;
    let weight = BigDecimal(reqDetail.remWeight);
    if (reqDetail.precision == 2) {
      weight = weight.div(BigDecimal(1000));
    }
    metages.some((x) => {
      if (!x.open || x.target) return false;
      if (type && x.type == type) {
        x.task = task;
        x.target = weight.toFixed(3);
        x.targetIndex = targetIndex;
        weight = 0;
        return true;
      } else if (x.type == '11') {
        return false;
      } else {
        const rule = find(rules, {value: x.type});
        if (!rule) return false;
        x.targetIndex = targetIndex;
        const min = BigDecimal(rule.useRange[0]);
        const max = BigDecimal(rule.useRange[1]);
        if (weight.cmp(min) >= 0 && weight.cmp(max) <= 0) {
          x.task = task;
          const useMax = BigDecimal(rule.max)
            .mul(BigDecimal(x.percentage))
            .div(BigDecimal(100));
          if (weight.cmp(useMax) > 0) {
            weight = weight.sub(useMax);
            x.target = useMax.toFixed(3);
          } else {
            x.target = weight.toFixed(3);
            weight = 0;
            return true;
          }
        }
      }
      return false;
    });
    reqDetail.remWeight = 0;
  };

  const onDragEnd = (result) => {
    const {source, destination} = result;
    if (destination) {
      const index = parseInt(
        destination.droppableId[destination.droppableId.length - 1]
      );
      if (index >= 0 && index < metages.length) {
        if (metages[index].target) {
          return notification.error({message: '该称中已安排任务'});
        }
        setMetageModalOpen(true);
        setCurrentTaskDetail(source.index);
        setCurrentMetage(index);
      }
    }
  };
  const onOk = (value) => {
    const reqDetail = taskDetail[currentTaskDetail];
    const metage = metages[currentMetage];
    metage.targetIndex = currentTaskDetail;
    metage.target = value;
    metage.task = `${reqDetail.matName}`;
    if (reqDetail.weight <= value) {
      reqDetail.weight = 0;
    } else {
      reqDetail.weight = BigDecimal(reqDetail.weight)
        .sub(BigDecimal(value))
        .toFixed(3);
    }
    setMetages([...metages]);
    setTaskDetail([...taskDetail]);
    setMetageModalOpen(false);
  };
  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Row gutter={8}>
          <Col span={18}>
            <Space direction="vertical" style={{width: '100%'}}>
              <Space direction="horizontal">
                <Button onClick={startTask}>开始任务</Button>
                <Button
                  onClick={() => {
                    invoke('socket_close');
                  }}
                >
                  断开
                </Button>

                <Button onClick={() => setMetageRuleModalOpen(true)}>
                  设置
                </Button>
              </Space>

              {/* <Row style={{justifyContent: 'center'}}>
                <FlopTime />
              </Row> */}
              <Row>
                {metages.map((metage, index) => (
                  <Droppable
                    droppableId={`metage-${index}`}
                    key={`metage-${index}`}
                  >
                    {(provided, snapshot) => (
                      <Col
                        span={6}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <Metage
                          setOpen={() => {
                            setMetageSettingModalOpen(true);
                            setCurrentMetage(index);
                          }}
                          data={metage}
                          options={rules}
                          isDraggingOver={snapshot.isDraggingOver}
                          reset={() => {
                            if (metage.targetIndex) {
                              taskDetail[metage.targetIndex].remWeight =
                                BigDecimal(
                                  taskDetail[metage.targetIndex].remWeight
                                )
                                  .add(BigDecimal(metage.target))
                                  .toFixed(3);
                              metage.targetIndex = undefined;
                              metage.target = undefined;
                              metage.task = undefined;
                              setMetages([...metages]);
                              setTaskDetail([...taskDetail]);
                            }
                          }}
                        />
                        {provided.placeholder}
                      </Col>
                    )}
                  </Droppable>
                ))}
              </Row>
            </Space>
          </Col>
          <Col span={6}>
            <Space style={{width: '100%'}} direction="vertical">
              <Space.Compact>
                <Input onChange={onInputChange} />
                <Button type="primary" onClick={divideTasks}>
                  分配
                </Button>
              </Space.Compact>
              {task && (
                <Card
                  title={`${task.matReqNo}`}
                  extra={`排产单:${task.productId}`}
                  key={'task'}
                >
                  <Row>
                    <Col span={8}>原料名</Col>
                    <Col span={8}>任务总重</Col>
                    <Col span={8}>待分重量</Col>
                  </Row>
                  <Droppable droppableId="taskSheet">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {taskDetail.map((t, index) => (
                          <Draggable
                            draggableId={`${task.id}-0${index + 1}`}
                            key={index + 1}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Row
                                  style={{
                                    cursor: 'grab',
                                    borderRadius: snapshot.isDragging
                                      ? '10px'
                                      : '',
                                    background: snapshot.isDragging
                                      ? '#91caff'
                                      : 'transparent',
                                  }}
                                >
                                  <Col span={8}>{t.matName}</Col>
                                  <Col span={8}>
                                    {t.weight}
                                    {precisionMap[t.precision]}
                                  </Col>
                                  <Col span={8}>
                                    {t.remWeight}
                                    {precisionMap[t.precision]}
                                  </Col>
                                </Row>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Card>
              )}
            </Space>
          </Col>
        </Row>
      </DragDropContext>
      {metageModalOpen && (
        <MetageModal
          open={metageModalOpen}
          setOpen={setMetageModalOpen}
          total={taskDetail[currentTaskDetail].remWeight}
          onOk={onOk}
          max={find(rules, {value: metages[currentMetage].type}).max}
          options={rules}
        />
      )}
      {metageSettingModalOpen && (
        <MetageSettingModal
          open={metageSettingModalOpen}
          setOpen={setMetageSettingModalOpen}
          data={metages[currentMetage]}
          reload={reloadMetages}
          options={rules}
        />
      )}
      {metageRuleModalOpen && (
        <MetageRuleModal
          open={metageRuleModalOpen}
          setOpen={setMetageRuleModalOpen}
          data={rules}
          reload={reloadRules}
        />
      )}
    </>
  );
};
