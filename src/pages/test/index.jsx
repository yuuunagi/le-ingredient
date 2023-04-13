import {useState} from 'react';
import {Droppable, Draggable, DragDropContext} from '@hello-pangea/dnd';
import {Row, Col, Card, notification, Space} from 'antd';
import Metage, {precisionMap} from './components/metage';
import MetageModal from './components/metageModal';

export default () => {
  const [tasks, setTasks] = useState([1, 2, 3, 4]);
  const [metages, setMetages] = useState([
    {name: 'LECZ0000001', value: '0.00', max: 10000, precision: 1},
    {name: 'LECZ0000002', value: '0.00', max: 100, precision: 1},
    {name: 'LECZ0000003', value: '0.00', max: 100, precision: 1},
    {name: 'LECZ0000004', value: '0.00', max: 100, precision: 1},
    {name: 'LECZ0000005', value: '0.00', max: 5000, precision: 2},
    {name: 'LECZ0000006', value: '0.00', max: 50, precision: 2},
    {name: 'LECZ0000007', value: '0.00', max: 50, precision: 2},
    {name: 'LECZ0000008', value: '0.00', max: 50, precision: 2},
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
