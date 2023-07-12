import {Row, Col, Card} from 'antd';
export default (props) => {
  return (
    <Row>
      <Col span={6}>
        <a href="/metage">
          <img alt="example" src="/MatProduct1.png" />
        </a>
      </Col>
      <Col span={6}>
        <a href="/instock">
          <img alt="example" src="/MatStock1.png" />
        </a>
      </Col>
      <Col span={6}>
        <a href="/instockHistory">
          <img alt="example" src="/MatStock3.png" />
        </a>
      </Col>
      <Col span={6} />
    </Row>
  );
};
