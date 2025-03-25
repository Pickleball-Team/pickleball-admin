import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Button,
  message,
  Checkbox,
  Collapse,
  Row,
  Col,
} from 'antd';
import moment from 'moment';
import { IMatch } from '../../../modules/Macths/models';
import { useUpdateMatch } from '../../../modules/Macths/hooks/useUpdateMatch';
import { useGetAllReferees } from '../../../modules/User/hooks/useGetAllReferees';
import { useGetVenueBySponnerId } from '../../../modules/Venues/hooks/useGetVenueBySponnerId';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Member, Team } from '../../../modules/Tournaments/models';
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
  console.log("match", match);

  useEffect(() => {
    if (match) {
      const userIds = match.teamResponse.flatMap((team: Team) =>
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

  const handleFinish = (values: any) => {
    const updatedValues = {
      ...values,
      matchDate: values.matchDate ? values.matchDate.toISOString() : null,
      venueId: values.venueId || null,
      refereeId: values.refereeId || null,
    };

    updateMatch(
      { id: match?.id, data: updatedValues },
      {
        onSuccess: () => {
          message.success('Match updated successfully');
          onClose();
          refetch();
        },
        onError: () => {
          message.error('Failed to update match');
        },
      }
    );
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
    ...(matchFormat === 1
      ? {
          player1Id: match?.teamResponse?.[0]?.members?.[0]?.playerId,
          player2Id: match?.teamResponse?.[1]?.members?.[0]?.playerId,
        }
      : {
          player1Id: match?.teamResponse?.[0]?.members?.[0]?.playerId,
          player2Id: match?.teamResponse?.[0]?.members?.[1]?.playerId,
          player3Id: match?.teamResponse?.[1]?.members?.[0]?.playerId,
          player4Id: match?.teamResponse?.[1]?.members?.[1]?.playerId,
        }),
  };

  return (
    <Modal
      visible={visible}
      title="Update Match"
      onCancel={onClose}
      footer={null}
      width={800} // Make the modal wider
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFinish}
      >
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
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="winScore" label="Win Score">
                  <Select>
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
                  <DatePicker showTime />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="Status">
                  <Select>
                    <Option value={1}>Scheduled</Option>
                    <Option value={3}>Ongoing</Option>
                    <Option value={2}>Completed</Option>
                    <Option value={4}>Cancelled</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="matchCategory" label="Match Category">
                  <Select>
                    <Option value={1}>Competitive</Option>
                    <Option value={2}>Custom</Option>
                    <Option value={3}>Tournament</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="matchFormat" label="Match Format">
                  <Select disabled>
                    <Option value={1}>Single</Option>
                    <Option value={2}>Team</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="isPublic"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Checkbox>Public</Checkbox>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="Description">
              <TextArea rows={4} />
            </Form.Item>
          </Panel>
          <Panel header="Referee and Venue" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="refereeId" label="Referee">
                  <Select showSearch optionFilterProp="children">
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
                  <Select showSearch optionFilterProp="children">
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
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateMatchModal;
