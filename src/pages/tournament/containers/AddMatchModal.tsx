import { Form, Input, Modal, Select } from 'antd';
import React from 'react';

const { Option } = Select;

type AddMatchModalProps = {
  visible: boolean;
  onClose: () => void;
};

const AddMatchModal: React.FC<AddMatchModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then(values => {
      console.log('Form values:', values);
      // Add your logic to handle form submission here
      onClose();
      form.resetFields();
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      title="Add Match"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Match Title"
          rules={[{ required: true, message: 'Please input the match title!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please input the description!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="matchDate"
          label="Match Date"
          rules={[{ required: true, message: 'Please input the match date!' }]}
        >
          <Input type="datetime-local" />
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select the status!' }]}
        >
          <Select>
            <Option value={1}>Scheduled</Option>
            <Option value={2}>Completed</Option>
            <Option value={3}>Ongoing</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddMatchModal;
