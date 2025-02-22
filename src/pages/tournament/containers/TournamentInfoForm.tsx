import React from 'react';
import { Form, Input, Button, Select, DatePicker, InputNumber, Row, Col } from 'antd';
import moment from 'moment';
import { TournamentType } from '../../../modules/Tournaments/models';

const { Option } = Select;
const { TextArea } = Input;

type TournamentInfoFormProps = {
  data: any;
  onSave: (values: any) => void;
};

const TournamentInfoForm = ({ data, onSave }: TournamentInfoFormProps) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    onSave(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        name: data?.name,
        location: data?.location,
        maxPlayer: data?.maxPlayer,
        totalPrize: data?.totalPrize,
        status: data?.status,
        type: data?.type,
        startDate: data?.startDate ? moment(data?.startDate) : null,
        endDate: data?.endDate ? moment(data?.endDate) : null,
        note: data?.note,
        description: data?.description,
        banner: data?.banner,
        isAccept: data?.isAccept,
      }}
      onFinish={handleFinish}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="location" label="Location" rules={[{ required: true, message: 'Please input the location!' }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="maxPlayer" label="Max Players" rules={[{ required: true, message: 'Please input the max players!' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="totalPrize" label="Total Prize" rules={[{ required: true, message: 'Please input the total prize!' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select the status!' }]}>
            <Select>
              <Option value="Scheduled">Scheduled</Option>
              <Option value="Ongoing">Ongoing</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Disable">Disable</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please select the type!' }]}>
            <Select>
              <Option value={TournamentType.Singles}>Singles</Option>
              <Option value={TournamentType.Doubles}>Doubles</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true, message: 'Please select the start date!' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="endDate" label="End Date" rules={[{ required: true, message: 'Please select the end date!' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="note" label="Note">
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item name="banner" label="Banner" rules={[{ required: true, message: 'Please input the banner URL!' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="isAccept" label="Is Accepted" rules={[{ required: true, message: 'Please select the acceptance status!' }]}>
        <Select>
          <Option value={true}>Accepted</Option>
          <Option value={false}>Not Accepted</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TournamentInfoForm;
