import { Form, Input, Modal, Select, Checkbox, Collapse, Row, Col } from 'antd';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useGetAllReferees } from '../../../modules/User/hooks/useGetAllReferees';
import { useGetTournamentById } from '../../../modules/Tournaments/hooks/useGetTournamentById';
import { useGetVenueBySponnerId } from '../../../modules/Venues/hooks/useGetVenueBySponnerId';
import { useCreateMatch } from '../../../modules/Macths/hooks/useCreateMatch';

const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

type AddMatchModalProps = {
  visible: boolean;
  onClose: () => void;
  refetch: () => void;
  tournamentId: number;
};

const AddMatchModal: React.FC<AddMatchModalProps> = ({ visible, onClose, tournamentId, refetch }) => {
  const [form] = Form.useForm();
  const user = useSelector((state: RootState) => state.authencation.user);
  const [matchFormat, setMatchFormat] = useState<number>(1);
  const [selectedPlayers, setSelectedPlayers] = useState<{ [key: string]: number | undefined }>({});

  const { data: referees } = useGetAllReferees();
  const { data: tournamentDetails } = useGetTournamentById(tournamentId);
  const { data: venues } = useGetVenueBySponnerId(user?.id || 0);

  const { mutate: createMatch, isError, error } = useCreateMatch();

  const handleOk = () => {
    form.validateFields().then(values => {
      const matchData = {
        ...values,
        roomOnwer: user?.id, // Note the typo here to match the interface
        tournamentId,
      };
      createMatch(matchData, {
        onSuccess: () => {
          onClose();
          form.resetFields();
          refetch();
        },
        onError: (err) => {
          console.error('Error creating match:', err);
        }
      });
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  const handlePlayerChange = (value: number, field: string) => {
    setSelectedPlayers(prev => ({ ...prev, [field]: value }));
  };

  const getFilteredPlayers = (excludeKeys: string[]) => {
    const selectedValues = Object.keys(selectedPlayers)
      .filter(key => excludeKeys.includes(key))
      .map(key => selectedPlayers[key]);
    return tournamentDetails?.registrationDetails?.filter(player => !selectedValues.includes(player.playerId));
  };

  return (
    <Modal
      title="Add Match"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800} // Make the modal wider
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: 'PickerPall champion',
          description: 'This is a sample description for the match.',
          matchCategory: 3,
          status: 1,
          matchFormat: 1,
          isPublic: true,
          winScore: 1,
        }}
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
                  rules={[{ required: true, message: 'Please select the win score!' }]}
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
                  rules={[{ required: true, message: 'Please input the match date!' }]}
                >
                  <Input type="datetime-local" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select the status!' }]}
                >
                  <Select disabled>
                    <Option value={1}>Scheduled</Option>
                    <Option value={2}>Ongoing</Option>
                    <Option value={3}>Completed</Option>
                    <Option value={4}>Disable</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="matchCategory"
                  label="Match Category"
                  rules={[{ required: true, message: 'Please select the match category!' }]}
                >
                  <Select disabled>
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
                  rules={[{ required: true, message: 'Please select the match format!' }]}
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
                
              </Col>
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
                  rules={[{ required: true, message: 'Please input the description!' }]}
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
                  rules={[{ required: true, message: 'Please select a referee!' }]}
                >
                  <Select showSearch optionFilterProp="children">
                    {referees?.map(referee => (
                      <Option key={referee.id} value={referee.id}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img src={referee.avatarUrl} alt="avatar" style={{ width: 20, height: 20, marginRight: 8 }} />
                          {referee.firstName} {referee.lastName}
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
                  rules={[{ required: true, message: 'Please select a venue!' }]}
                >
                  <Select showSearch optionFilterProp="children">
                    {venues?.map(venue => (
                      <Option key={venue.id} value={venue.id}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <img src={venue.urlImage} alt="venue" style={{ width: 20, height: 20, marginRight: 8 }} />
                          <div>{venue.name}</div>
                          <div style={{ fontSize: 'small', color: 'gray' }}>{venue.address}</div>
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
                      rules={[{ required: true, message: 'Please select player 1!' }]}
                    >
                      <Select
                        showSearch
                        optionFilterProp="children"
                        onChange={(value) => handlePlayerChange(value, 'player1Id')}
                      >
                        {getFilteredPlayers(['player2Id'])?.map(player => (
                          <Option key={player.playerId} value={player.playerId}>
                            <img src={player.playerDetails.avatarUrl} alt="avatar" style={{ width: 20, height: 20, marginRight: 8 }} />
                            {player.playerDetails.firstName} {player.playerDetails.lastName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="player2Id"
                      label="Player 2"
                      rules={[{ required: true, message: 'Please select player 2!' }]}
                    >
                      <Select
                        showSearch
                        optionFilterProp="children"
                        onChange={(value) => handlePlayerChange(value, 'player2Id')}
                      >
                        {getFilteredPlayers(['player1Id'])?.map(player => (
                          <Option key={player.playerId} value={player.playerId}>
                            <img src={player.playerDetails.avatarUrl} alt="avatar" style={{ width: 20, height: 20, marginRight: 8 }} />
                            {player.playerDetails.firstName} {player.playerDetails.lastName}
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
                      rules={[{ required: true, message: 'Please select player 1!' }]}
                    >
                      <Select
                        showSearch
                        optionFilterProp="children"
                        onChange={(value) => handlePlayerChange(value, 'player1Id')}
                      >
                        {getFilteredPlayers(['player2Id', 'player3Id', 'player4Id'])?.map(player => (
                          <Option key={player.playerId} value={player.playerId}>
                            <img src={player.playerDetails.avatarUrl} alt="avatar" style={{ width: 20, height: 20, marginRight: 8 }} />
                            {player.playerDetails.firstName} {player.playerDetails.lastName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="player2Id"
                      label="Team 1 - Player 2"
                      rules={[{ required: true, message: 'Please select player 2!' }]}
                    >
                      <Select
                        showSearch
                        optionFilterProp="children"
                        onChange={(value) => handlePlayerChange(value, 'player2Id')}
                      >
                        {getFilteredPlayers(['player1Id', 'player3Id', 'player4Id'])?.map(player => (
                          <Option key={player.playerId} value={player.playerId}>
                            <img src={player.playerDetails.avatarUrl} alt="avatar" style={{ width: 20, height: 20, marginRight: 8 }} />
                            {player.playerDetails.firstName} {player.playerDetails.lastName}
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
                      rules={[{ required: true, message: 'Please select player 3!' }]}
                    >
                      <Select
                        showSearch
                        optionFilterProp="children"
                        onChange={(value) => handlePlayerChange(value, 'player3Id')}
                      >
                        {getFilteredPlayers(['player1Id', 'player2Id', 'player4Id'])?.map(player => (
                          <Option key={player.playerId} value={player.playerId}>
                            <img src={player.playerDetails.avatarUrl} alt="avatar" style={{ width: 20, height: 20, marginRight: 8 }} />
                            {player.playerDetails.firstName} {player.playerDetails.lastName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="player4Id"
                      label="Team 2 - Player 2"
                      rules={[{ required: true, message: 'Please select player 4!' }]}
                    >
                      <Select
                        showSearch
                        optionFilterProp="children"
                        onChange={(value) => handlePlayerChange(value, 'player4Id')}
                      >
                        {getFilteredPlayers(['player1Id', 'player2Id', 'player3Id'])?.map(player => (
                          <Option key={player.playerId} value={player.playerId}>
                            <img src={player.playerDetails.avatarUrl} alt="avatar" style={{ width: 20, height: 20, marginRight: 8 }} />
                            {player.playerDetails.firstName} {player.playerDetails.lastName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
          </Panel>
        </Collapse>
        {isError && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      </Form>
    </Modal>
  );
};

export default AddMatchModal;
