import React from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  message,
} from 'antd';
import moment from 'moment';
import { TournamentType } from '../../../modules/Tournaments/models';
import { useUpdateTournament } from '../../../modules/Tournaments/hooks/useUpdateTournamen';

const { Option } = Select;
const { TextArea } = Input;

type TournamentInfoFormProps = {
  data: any;
  onSave: (values: any) => void;
};

const TournamentInfoForm = ({ data, onSave }: TournamentInfoFormProps) => {
  const [form] = Form.useForm();
  const { mutate: updateTournament } = useUpdateTournament();

  const handleFinish = (values: any) => {
    const updatedValues = {
      ...values,
      startDate: values.startDate ? values.startDate.toISOString() : null,
      endDate: values.endDate ? values.endDate.toISOString() : null,
    };

    // Filter out unchanged fields
    const fieldsToUpdate = Object.keys(updatedValues).reduce((acc, key) => {
      if (updatedValues[key] !== data[key]) {
        acc[key] = updatedValues[key];
      }
      return acc;
    }, {} as any);

    updateTournament(
      { id: data.id, data: fieldsToUpdate },
      {
        onSuccess: () => {
          message.success('Tournament updated successfully');
          onSave(updatedValues);
        },
        onError: () => {
          message.error('Failed to update tournament');
        },
      }
    );
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
        banner: data?.banner,
      }}
      onFinish={handleFinish}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please input the location!' }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="maxPlayer"
            label="Max Players"
            rules={[
              { required: true, message: 'Please input the max players!' },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="totalPrize"
            label="Total Prize"
            rules={[
              { required: true, message: 'Please input the total prize!' },
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select>
              <Option value="Scheduled">Scheduled</Option>
              <Option value="Ongoing">Ongoing</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Disable">Disable</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select the type!' }]}
          >
            <Select>
              <Option value={TournamentType.Singles}>Singles</Option>
              <Option value={TournamentType.Doubles}>Doubles</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[
              { required: true, message: 'Please select the start date!' },
            ]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: 'Please select the end date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="note" label="Note">
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item
        name="banner"
        label="Banner"
        rules={[{ required: true, message: 'Please input the banner URL!' }]}
      >
        <Input />
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
