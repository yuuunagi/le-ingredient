import {useState} from 'react';
import {Droppable, Draggable, DragDropContext} from '@hello-pangea/dnd';
import {Row, Col, Card, notification, Space, Button} from 'antd';
import Metage, {precisionMap} from './components/metage';
import MetageModal from './components/metageModal';
import { invoke } from '@tauri-apps/api/tauri'
import { useEffect } from 'react';
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
  .map(b => b.toString(16).padStart(2, '0')) // 将每个字节转换为16进制字符串，并用0补齐两位
  .join(''); // 将所有的16进制字符串拼接成一个完整的字符串
  console.log(hex)
  return hex;
}
const deviation = float2hex('0.01')
let t = null
export default () => {
  const [tasks, setTasks] = useState([1, 2, 3, 4]);
  const [metages, setMetages] = useState([
    {name: 'LECZ0000001', value: '0.000', max: 10000, precision: 1},
    {name: 'LECZ0000002', value: '0.000', max: 100, precision: 1},
    {name: 'LECZ0000003', value: '0.000', max: 100, precision: 1},
    {name: 'LECZ0000004', value: '0.000', max: 100, precision: 1},
    {name: 'LECZ0000005', value: '0.000', max: 5000, precision: 2},
    {name: 'LECZ0000006', value: '0.000', max: 50, precision: 2},
    {name: 'LECZ0000007', value: '0.000', max: 50, precision: 2},
    {name: 'LECZ0000008', value: '0.000', max: 50, precision: 2},
  ]);
  const [taskDetails, setTaskDetails] = useState([
    [
      ['砂', 'HS', '40-70', 600, 1],
      ['砂', 'TKS', '8-16', 30, 2],
      ['粉', 'HS', '325/96', 100, 1],
      ['粉', 'MT325', '80-85', 10, 2],
    ],
    [
      ['砂', 'HS', '40-70', 600, 1],
      ['砂', 'TKS', '8-16', 30, 2],
      ['粉', 'HS', '325/96', 100, 1],
      ['粉', 'MT325', '80-85', 10, 2],
    ],
    [
      ['砂', 'HS', '40-70', 600, 1],
      ['砂', 'TKS', '8-16', 30, 2],
      ['粉', 'HS', '325/96', 100, 1],
      ['粉', 'MT325', '80-85', 10, 2],
    ],
    [
      ['砂', 'HS', '40-70', 600, 1],
      ['砂', 'TKS', '8-16', 30, 2],
      ['粉', 'HS', '325/96', 100, 1],
      ['粉', 'MT325', '80-85', 10, 2],
    ],
  ]);
  const [metageModalOpen, setMetageModalOpen] = useState(false);
  const [currentTaskDetail, setCurrentTaskDetail] = useState(-1);
  const [currentMetage, setCurrentMetage] = useState(-1);
  useEffect(()=>{
    invoke('socket_connect', { addr: '192.168.0.1:2000' }).then(res=>{
      if('Connected successfully' == res || 'Already connected' == res){
        clearInterval(t)
        t = setInterval(() => {
          invoke('socket_read').then(res=>{
            if(!res) return 
            const v1 = convertFloat(res.slice(0, 4));
            const v2 = convertFloat(res.slice(6, 10));
            if(metages[0].value != v1 || metages[1].value != v2 ){
              metages[0].value = v1
              metages[1].value = v2
              setMetages([...metages])
            }
          }).catch(err=>{
            notification.error({message: err.toString()})
          })
        }, 1000);
      } else {
        notification.error({message: res})
      }
    }).catch(err=>{
      notification.error({message: err.toString()})
    })
  }, [])
  const onDragEnd = (result) => {
    const {source, destination} = result;
    console.log(source, destination);
    if (destination) {
      const index = parseInt(
        destination.droppableId[destination.droppableId.length - 1]
      );
      if (index >= 0 && index < metages.length) {
        if (metages[index].target) {
          return notification.error({message: '该称中已安排任务'});
        }
        const taskDetail = taskDetails[0][source.index];
        const metage = metages[index];
        if (metage.precision != taskDetail[4]) {
          return notification.error({message: '精度不匹配'});
        }
        setMetageModalOpen(true);
        setCurrentTaskDetail(source.index);
        setCurrentMetage(index);
      }
    }
  };
  const onOk = (value) => {
    const taskDetail = taskDetails[0][currentTaskDetail];
    const metage = metages[currentMetage];
    metage.target = value;
    metage.task = `${taskDetail[0]} ${taskDetail[1]} ${taskDetail[2]}`;
    if (taskDetail[3] <= value) {
      taskDetails[0].splice(currentTaskDetail, 1);
      if (taskDetails[0].length == 0) {
        taskDetails.splice(0, 1);
        tasks.splice(0, 1);
      }
    } else {
      taskDetail[3] -= value;
    }
    setMetages([...metages]);
    setTaskDetails([...taskDetails]);
    setMetageModalOpen(false);
  };
  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Row gutter={8}>
          <Col span={18}>
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
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
                          name={metage.name}
                          value={metage.value}
                          task={metage.task}
                          target={metage.target}
                          isDraggingOver={snapshot.isDraggingOver}
                          max={metage.max}
                          precision={metage.precision}
                        />
                        {provided.placeholder}
                      </Col>
                    )}
                  </Droppable>
                ))}
              </Row>
              <Button onClick={
                ()=>{
                  invoke('socket_close')
                }
              }>断开</Button>
              <Button onClick={
                ()=>{
                  invoke('socket_write',
                  {message: `0000${float2hex(metages[0].target)}${deviation}0100${float2hex(metages[1].target)}${deviation}0100`})
                }
              }>开始任务</Button>
            </Space>
          </Col>
          <Col span={6}>
            {tasks.map((task, i) => (
              <Card
                title={`任务号LE00000${task}(9812)`}
                extra={`${task}/10`}
                key={task}
              >
                {i == 0 ? (
                  <Droppable droppableId="taskSheet">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {taskDetails[i].map((taskDetail, index) => (
                          <Draggable
                            draggableId={`tast00000${task}-0${index + 1}`}
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
                                  <Col span={6}>{taskDetail[0]}</Col>
                                  <Col span={6}>{taskDetail[1]}</Col>
                                  <Col span={6}>{taskDetail[2]}</Col>
                                  <Col span={6}>
                                    {taskDetail[3]}
                                    {precisionMap[taskDetail[4]]}
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
                ) : (
                  taskDetails[i].map((taskDetail, index) => (
                    <Row key={index}>
                      <Col span={6}>{taskDetail[0]}</Col>
                      <Col span={6}>{taskDetail[1]}</Col>
                      <Col span={6}>{taskDetail[2]}</Col>
                      <Col span={6}>
                        {taskDetail[3]}
                        {precisionMap[taskDetail[4]]}
                      </Col>
                    </Row>
                  ))
                )}
              </Card>
            ))}
          </Col>
        </Row>
      </DragDropContext>
      {metageModalOpen && (
        <MetageModal
          open={metageModalOpen}
          setOpen={setMetageModalOpen}
          total={taskDetails[0][currentTaskDetail][3]}
          max={metages[currentMetage].max}
          onOk={onOk}
        />
      )}
    </>
  );
};
