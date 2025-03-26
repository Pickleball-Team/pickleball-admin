import React from 'react';
import { Form, Row, Col, InputNumber, Select, Input, Button, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

interface ScoreEntryFormProps {
  form: any;
  isEditing: boolean;
  onFinish: (values: any) => void;
  onCancel: () => void;
  initialValues: {
    round?: number;
    currentHaft: number; // Note: using currentHaft to match the interface
    team1Score: number;
    team2Score: number;
    note: string;
  };
}

const ScoreEntryForm: React.FC<ScoreEntryFormProps> = ({
  form,
  isEditing,
  onFinish,
  onCancel,
  initialValues,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
    >
      {isEditing && (
        <Form.Item name="round" hidden>
          <InputNumber />
        </Form.Item>
      )}

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="team1Score"
            label="Team 1 Score"
            rules={[{ required: true, message: 'Please enter Team 1 score' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="team2Score"
            label="Team 2 Score"
            rules={[{ required: true, message: 'Please enter Team 2 score' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="currentHaft"
        label="Current Half"
        rules={[{ required: true, message: 'Please select the current half' }]}
      >
        <Select>
          <Option value={1}>First Half</Option>
          <Option value={2}>Second Half</Option>
          <Option value={3}>Overtime</Option>
        </Select>
      </Form.Item>

      <Form.Item name="note" label="Notes">
        <TextArea rows={4} placeholder="Add any notes about this round..." />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            {isEditing ? 'Update Score' : 'Add Score'}
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ScoreEntryForm;
