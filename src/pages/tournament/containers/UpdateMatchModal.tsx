import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  message,
  Collapse,
  Row,
  Col,
  Space,
  Alert,
  Tooltip,
} from 'antd';
import moment from 'moment';
import { IMatch } from '../../../modules/Macths/models';
import { useUpdateMatch } from '../../../modules/Macths/hooks/useUpdateMatch';
import { useGetAllReferees } from '../../../modules/User/hooks/useGetAllReferees';
import { useGetVenueBySponnerId } from '../../../modules/Venues/hooks/useGetVenueBySponnerId';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { fetchUserById } from '../../../modules/User/hooks/useGetUserById';
import { User } from '../../../modules/User/models';

const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

type UpdateMatchModalProps = {
  visible: boolean;
  onClose: () => void;
  match: IMatch;
  refetch: () => void;
};

const UpdateMatchModal: React.FC<UpdateMatchModalProps> = ({
  visible,
  onClose,
  match,
  refetch,
}) => {
  const [form] = Form.useForm();
  const user = useSelector((state: RootState) => state.authencation.user);
  const { data: referees } = useGetAllReferees();
  const { data: venues } = useGetVenueBySponnerId(user?.id || 0);
  const { mutate: updateMatch } = useUpdateMatch();
  const [matchFormat, setMatchFormat] = useState<number>(match?.matchFormat);
  const [userDetails, setUserDetails] = useState<User[]>([]);
  const userCache = useRef<Map<number, User>>(new Map());
  const [currentStatus, setCurrentStatus] = useState<number>(match?.status);
  const isEditable = currentStatus === 1; // Only editable if Scheduled (1)

  useEffect(() => {
    if (match) {
      const userIds = match.teamResponse.flatMap((team: { members: any[]; }) =>
        team.members.map((member) => member.playerId)
      );

      const fetchUsers = async () => {
        const uniqueUserIds = Array.from(new Set(userIds));
        const userPromises = uniqueUserIds.map(async (id) => {
          if (userCache.current.has(Number(id))) {
            return userCache.current.get(Number(id));
          } else {
            const user = await fetchUserById(Number(id));
            userCache.current.set(Number(id), user);
            return user;
          }
        });

        const users = await Promise.all(userPromises);
        setUserDetails(
          users.filter((user): user is User => user !== undefined)
        );
      };

      fetchUsers();
    }
  }, [match]);

  const getUserById = (id: number) =>
    userDetails.find((user) => user?.id === id);

  const handleStatusChange = (value: number) => {
    setCurrentStatus(value);
  };

  const handleFinish = (values: any) => {
    try {
      // Convert form values to proper types
      const numericFields = ['winScore', 'team1Score', 'team2Score'];
      numericFields.forEach((field) => {
        if (values[field] !== undefined && values[field] !== null) {
          values[field] = Number(values[field]);
        }
      });

      // Process values and prepare data
      const processedValues = {
        ...values,
        matchDate: values.matchDate ? values.matchDate.toISOString() : null,
        venueId: values.venueId || null,
        refereeId: values.refereeId || null,
        status: Number(values.status),
        matchCategory: Number(values.matchCategory),
      };

      // Compare with initial values to find changed fields
      const changedFields: Record<string, any> = {};

      Object.keys(processedValues).forEach((key) => {
        // Skip undefined values
        if (processedValues[key] === undefined) return;

        // Handle date comparison specially
        if (key === 'matchDate') {
          const originalDate = match?.matchDate
            ? moment(match.matchDate).toISOString()
            : null;
          if (originalDate !== processedValues[key]) {
            changedFields[key] = processedValues[key];
          }
          return;
        }

        // For all other fields, direct comparison
        if (match && match[key as keyof IMatch] !== processedValues[key]) {
          changedFields[key] = processedValues[key];
        }
      });

      console.log('Changed fields:', changedFields);
      console.log('match id:', match?.id);

      // Only proceed if there are changes
      if (Object.keys(changedFields).length === 0) {
        message.info('No changes detected');
        return;
      }

      // Update only the changed fields
      updateMatch(
        { id: match?.id, data: changedFields },
        {
          onSuccess: () => {
            message.success('Match updated successfully');
            onClose();
            refetch();
          },
          onError: (error) => {
            console.error('Update error:', error);
            message.error('Failed to update match');
          },
        }
      );
    } catch (error) {
      console.error('Error in handleFinish:', error);
      message.error('An error occurred while processing your request');
    }
  };

  const initialValues = {
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
    team1Score: match?.team1Score,
    team2Score: match?.team2Score,
  };

  return (
    <Modal
      visible={visible}
      title="Update Match"
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFinish}
      >
        {/* Status alert when match is not editable */}
        {!isEditable && currentStatus !== 1 && (
          <Alert
            message="Limited Edit Mode"
            description="This match is no longer in 'Scheduled' status. You can only update the status field."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="status"
              label={
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                  Match Status
                </span>
              }
              rules={[
                { required: true, message: 'Please select the match status' },
              ]}
            >
              <Select
                style={{
                  borderColor: '#1890ff',
                  boxShadow: '0 0 0 2px rgba(24,144,255,0.2)',
                }}
                onChange={handleStatusChange}
              >
                <Option value={1}>Scheduled</Option>
                <Option value={3}>Ongoing</Option>
                <Option value={2}>Completed</Option>
                <Option value={4}>Cancelled</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Collapse defaultActiveKey={['1']}>
          <Panel header="Match Details" key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="Match Title"
                  rules={[
                    {
                      required: true,
                      message: 'Please input the match title!',
                    },
                  ]}
                >
                  <Input disabled={!isEditable} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="winScore" label="Win Score">
                  <Select disabled={!isEditable}>
                    <Option value={1}>11</Option>
                    <Option value={2}>15</Option>
                    <Option value={3}>21</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="matchDate" label="Match Date">
                  <DatePicker showTime disabled={!isEditable} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="Description">
              <TextArea rows={4} disabled={!isEditable} />
            </Form.Item>
          </Panel>
          <Panel header="Referee and Venue" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="refereeId" label="Referee">
                  <Select
                    showSearch
                    optionFilterProp="children"
                    disabled={!isEditable}
                  >
                    {referees?.map((referee) => (
                      <Option key={referee?.id} value={referee?.id}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img
                            src={referee?.avatarUrl}
                            alt="avatar"
                            style={{ width: 20, height: 20, marginRight: 8 }}
                          />
                          {referee?.firstName} {referee?.lastName}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="venueId" label="Venue">
                  <Select
                    showSearch
                    optionFilterProp="children"
                    disabled={!isEditable}
                  >
                    {venues?.map((venue) => (
                      <Option key={venue?.id} value={venue?.id}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <img
                            src={venue?.urlImage}
                            alt="venue"
                            style={{ width: 20, height: 20, marginRight: 8 }}
                          />
                          <div>{venue?.name}</div>
                          <div style={{ fontSize: 'small', color: 'gray' }}>
                            {venue?.address}
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Panel>
        </Collapse>

        <Form.Item>
          <div
            style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}
          >
            <Space>
              <Button onClick={onClose}>Cancel</Button>
              <Tooltip
                title={
                  !isEditable
                    ? "You can only update the status when match is not in 'Scheduled' state"
                    : ''
                }
              >
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              </Tooltip>
            </Space>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateMatchModal;
