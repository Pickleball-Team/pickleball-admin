import React from 'react';
import { Modal, Form, Input, DatePicker, Select, InputNumber, Button, message } from 'antd';
import moment from 'moment';
import { IMatch } from '../../../modules/Macths/models';
import { useUpdateMatch } from '../../../modules/Macths/hooks/useUpdateMatch';

const { Option } = Select;

type UpdateMatchModalProps = {
  visible: boolean;
  onClose: () => void;
  match: IMatch;
  refetch: () => void;
};

const UpdateMatchModal: React.FC<UpdateMatchModalProps> = ({ visible, onClose, match, refetch }) => {
  const [form] = Form.useForm();
  const { mutate: updateMatch } = useUpdateMatch();

  const handleFinish = (values: any) => {
    const updatedValues = {
      ...values,
      matchDate: values.matchDate ? values.matchDate.toISOString() : null,
      venueId: values.venueId || null,
      refereeId: values.refereeId || null,
    };

    updateMatch(
      { id: match.id, data: updatedValues },
      {
        onSuccess: () => {
          message.success('Match updated successfully');
      
          onClose();
        },
        onError: () => {
          message.error('Failed to update match');
        },
      }
    );
    refetch();
  };

  return (
    <Modal
      visible={visible}
      title="Update Match"
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: match?.title,
          description: match?.description,
          matchDate: match?.matchDate ? moment(match?.matchDate) : null,
          venueId: match?.venueId,
          status: match?.status,
          matchCategory: match?.matchCategory,
          matchFormat: match?.matchFormat,
          winScore: match?.winScore,
          isPublic: match?.isPublic,
          refereeId: match?.refereeId,
        }}
        onFinish={handleFinish}
      >
        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please input the title!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input />
        </Form.Item>
        <Form.Item name="matchDate" label="Match Date" rules={[{ required: true, message: 'Please select the match date!' }]}>
          <DatePicker showTime />
        </Form.Item>
        <Form.Item name="venueId" label="Venue ID">
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select the status!' }]}>
          <Select>
            <Option value={1}>Scheduled</Option>
            <Option value={2}>Ongoing</Option>
            <Option value={3}>Completed</Option>
            <Option value={4}>Cancelled</Option>
          </Select>
        </Form.Item>
        <Form.Item name="matchCategory" label="Match Category" rules={[{ required: true, message: 'Please select the match category!' }]}>
          <Select>
            <Option value={1}>Category 1</Option>
            <Option value={2}>Category 2</Option>
          </Select>
        </Form.Item>
        <Form.Item name="matchFormat" label="Match Format" rules={[{ required: true, message: 'Please select the match format!' }]}>
          <Select>
            <Option value={1}>Format 1</Option>
            <Option value={2}>Format 2</Option>
          </Select>
        </Form.Item>
        <Form.Item name="winScore" label="Win Score" rules={[{ required: true, message: 'Please input the win score!' }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="isPublic" label="Is Public" rules={[{ required: true, message: 'Please select the public status!' }]}>
          <Select>
            <Option value={true}>Public</Option>
            <Option value={false}>Private</Option>
          </Select>
        </Form.Item>
        <Form.Item name="refereeId" label="Referee ID">
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateMatchModal;
