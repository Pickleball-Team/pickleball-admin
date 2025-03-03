import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, InputNumber, Button, message, Checkbox, Collapse, Row, Col } from 'antd';
import moment from 'moment';
import { IMatch } from '../../../modules/Macths/models';
import { useUpdateMatch } from '../../../modules/Macths/hooks/useUpdateMatch';
import { useGetAllReferees } from '../../../modules/User/hooks/useGetAllReferees';
import { useGetVenueBySponnerId } from '../../../modules/Venues/hooks/useGetVenueBySponnerId';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Member } from '../../../modules/Tournaments/models';

const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

type UpdateMatchModalProps = {
  visible: boolean;
  onClose: () => void;
  match: IMatch;
  refetch: () => void;
};

const UpdateMatchModal: React.FC<UpdateMatchModalProps> = ({ visible, onClose, match, refetch }) => {
  const [form] = Form.useForm();
  const user = useSelector((state: RootState) => state.authencation.user);
  const { data: referees } = useGetAllReferees();
  const { data: venues } = useGetVenueBySponnerId(user?.id || 0);
  const { mutate: updateMatch } = useUpdateMatch();
  const [matchFormat, setMatchFormat] = useState<number>(match?.matchFormat);

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
          team1Score: match?.team1Score,
          team2Score: match?.team2Score,
        }}
        onFinish={handleFinish}
      >
        <Collapse defaultActiveKey={['1']}>
          <Panel header="Match Details" key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="Match Title"
                  rules={[{ required: true, message: 'Please input the match title!' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="winScore"
                  label="Win Score"
                >
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
                <Form.Item
                  name="matchDate"
                  label="Match Date"
                >
                  <DatePicker showTime />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                >
                  <Select>
                    <Option value={1}>Scheduled</Option>
                    <Option value={2}>Ongoing</Option>
                    <Option value={3}>Completed</Option>
                    <Option value={4}>Cancelled</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="matchCategory"
                  label="Match Category"
                >
                  <Select>
                    <Option value={1}>Competitive</Option>
                    <Option value={2}>Custom</Option>
                    <Option value={3}>Tournament</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="matchFormat"
                  label="Match Format"
                >
                  <Select onChange={(value) => setMatchFormat(value)}>
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
            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea rows={4} />
            </Form.Item>
          </Panel>
          <Panel header="Referee and Venue" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="refereeId"
                  label="Referee"
                >
                  <Select showSearch optionFilterProp="children">
                    {referees?.map(referee => (
                      <Option key={referee?.id} value={referee?.id}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img src={referee?.avatarUrl} alt="avatar" style={{ width: 20, height: 20, marginRight: 8 }} />
                          {referee?.firstName} {referee?.lastName}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="venueId"
                  label="Venue"
                >
                  <Select showSearch optionFilterProp="children">
                    {venues?.map(venue => (
                      <Option key={venue?.id} value={venue?.id}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <img src={venue?.urlImage} alt="venue" style={{ width: 20, height: 20, marginRight: 8 }} />
                          <div>{venue?.name}</div>
                          <div style={{ fontSize: 'small', color: 'gray' }}>{venue?.address}</div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Panel>
          <Panel header="Players" key="3">
            {matchFormat === 1 ? (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="player1Id"
                      label="Player 1"
                    >
                      <Select
                        showSearch
                        optionFilterProp="children"
                      >
                        {match?.teamResponse?.[0]?.members.map((player: Member) => (
                          <Option key={player?.playerId} value={player?.playerId}>
                            <img src={player?.playerDetails?.avatarUrl} alt="avatar" style={{ width: 20, height: 20, marginRight: 8 }} />
                            {player?.playerDetails?.firstName} {player?.playerDetails?.lastName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="player2Id"
                      label="Player 2"
                    >
                      <Select
                        showSearch
                        optionFilterProp="children"
                      >
                        {match?.teamResponse?.[1]?.members.map((player: Member) => (
                          <Option key={player?.playerId} value={player?.playerId}>
                            <img src={player?.playerDetails?.avatarUrl} alt="avatar" style={{ width: 20, height: 20, marginRight: 8 }} />
                            {player?.playerDetails?.firstName} {player?.playerDetails?.lastName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            ) : (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="player1Id"
                      label="Team 1 - Player 1"
                    >
                      <Select
                        showSearch
                        optionFilterProp="children"
                      >
                        {match?.teamResponse?.[0]?.members.map((player: Member) => (
                          <Option key={player?.playerId} value={player?.playerId}>
                            <img src={player?.playerDetails?.avatarUrl} alt="avatar" style={{ width: 20, height: 20, marginRight: 8 }} />
                            {player?.playerDetails?.firstName} {player?.playerDetails?.lastName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="player2Id"
                      label="Team 1 - Player 2"
                    >
                      <Select
                        showSearch
                        optionFilterProp="children"
                      >
                        {match?.teamResponse?.[0]?.members.map((player: Member) => (
                          <Option key={player?.playerId} value={player?.playerId}>
                            <img src={player?.playerDetails?.avatarUrl} alt="avatar" style={{ width: 20, height: 20, marginRight: 8 }} />
                            {player?.playerDetails?.firstName} {player?.playerDetails?.lastName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="player3Id"
                      label="Team 2 - Player 1"
                    >
                      <Select
                        showSearch
                        optionFilterProp="children"
                      >
                        {match?.teamResponse?.[1]?.members.map((player: Member) => (
                          <Option key={player?.playerId} value={player?.playerId}>
                            <img src={player?.playerDetails?.avatarUrl} alt="avatar" style={{ width: 20, height: 20, marginRight: 8 }} />
                            {player?.playerDetails?.firstName} {player?.playerDetails?.lastName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="player4Id"
                      label="Team 2 - Player 2"
                    >
                      <Select
                        showSearch
                        optionFilterProp="children"
                      >
                        {match?.teamResponse?.[1]?.members.map((player: Member) => (
                          <Option key={player?.playerId} value={player?.playerId}>
                            <img src={player?.playerDetails?.avatarUrl} alt="avatar" style={{ width: 20, height: 20, marginRight: 8 }} />
                            {player?.playerDetails?.firstName} {player?.playerDetails?.lastName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
          </Panel>
          <Panel header="Scores" key="4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="team1Score"
                  label="Team 1 Score"
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="team2Score"
                  label="Team 2 Score"
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
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
