import {
  Form,
  Input,
  Modal,
  Select,
  Checkbox,
  Collapse,
  Row,
  Col,
  Button,
  message,
  Switch,
  Space,
  Tooltip,
} from 'antd';
import seedrandom from 'seedrandom';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useGetAllReferees } from '../../../modules/User/hooks/useGetAllReferees';
import { useGetTournamentById } from '../../../modules/Tournaments/hooks/useGetTournamentById';
import { useGetVenueBySponnerId } from '../../../modules/Venues/hooks/useGetVenueBySponnerId';
import { useCreateMatch } from '../../../modules/Macths/hooks/useCreateMatch';
import { useGetMatchByTournamentId } from '../../../modules/Tournaments/hooks/useGetMatchByTournamentId';
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

// Enum for Match Format to match backend
enum MatchFormat {
  SingleMale = 1,
  SingleFemale = 2,
  DoubleMale = 3,
  DoubleFemale = 4,
  DoubleMix = 5,
}

type AddMatchModalProps = {
  visible: boolean;
  onClose: () => void;
  refetch: () => void;
  tournamentId: number;
};

// Utility functions for localStorage
const getAssignedTeamsFromStorage = (tournamentId: number): number[] => {
  const key = `tournament_${tournamentId}_assigned_teams`;
  const teamsString = localStorage.getItem(key);
  return teamsString ? JSON.parse(teamsString) : [];
};

const saveAssignedTeamsToStorage = (
  tournamentId: number,
  teamIds: number[]
) => {
  const key = `tournament_${tournamentId}_assigned_teams`;
  const existingTeams = getAssignedTeamsFromStorage(tournamentId);
  const uniqueTeams = [...new Set([...existingTeams, ...teamIds])];
  localStorage.setItem(key, JSON.stringify(uniqueTeams));
};

const clearAssignedTeamsFromStorage = (tournamentId: number) => {
  const key = `tournament_${tournamentId}_assigned_teams`;
  localStorage.removeItem(key);
};

const AddMatchModal: React.FC<AddMatchModalProps> = ({
  visible,
  onClose,
  tournamentId,
  refetch,
}) => {
  const [form] = Form.useForm();
  const user = useSelector((state: RootState) => state.authencation.user);
  const [matchFormat, setMatchFormat] = useState<number>(
    MatchFormat.SingleMale
  );
  const [selectedTeams, setSelectedTeams] = useState<{
    [key: string]: number | undefined;
  }>({});
  const [hideAssignedTeams, setHideAssignedTeams] = useState<boolean>(true);
  const [assignedTeams, setAssignedTeams] = useState<number[]>([]);

  const { data: referees } = useGetAllReferees();
  const { data: tournamentDetails } = useGetTournamentById(tournamentId);
  const { data: venues } = useGetVenueBySponnerId(user?.id || 0);
  const { data: matchs } = useGetMatchByTournamentId(tournamentId);

  const { mutate: createMatch, isError, error } = useCreateMatch();

  // Load assigned teams from localStorage when component mounts
  useEffect(() => {
    if (tournamentId) {
      const storedTeams = getAssignedTeamsFromStorage(tournamentId);
      setAssignedTeams(storedTeams);
    }
  }, [tournamentId]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        // Find the selected teams
        const team1 = tournamentDetails?.registrationDetails?.find(
          (team) => team.id === values.team1Id
        );
        const team2 = tournamentDetails?.registrationDetails?.find(
          (team) => team.id === values.team2Id
        );

        if (!team1 || !team2) {
          message.error('Selected teams not found');
          return;
        }

        // Prepare match data based on match format
        let matchData;

        // Check if the format is Singles (SingleMale=1 or SingleFemale=2)
        if (
          matchFormat === MatchFormat.SingleMale ||
          matchFormat === MatchFormat.SingleFemale
        ) {
          matchData = {
            ...values,
            roomOnwer: user?.id,
            tournamentId,
            player1Id: team1.playerId, // First player from team 1
            player2Id: team2.playerId, // First player from team 2
          };
        } else {
          // Double formats (DoubleMale=3, DoubleFemale=4, DoubleMix=5)
          matchData = {
            ...values,
            roomOnwer: user?.id,
            tournamentId,
            player1Id: team1.playerId, // First player from team 1
            player2Id: team1.partnerId, // Partner from team 1
            player3Id: team2.playerId, // First player from team 2
            player4Id: team2.partnerId, // Partner from team 2
          };
        }

        // Create the match with the prepared data
        createMatch(matchData, {
          onSuccess: () => {
            // Save the selected teams to localStorage
            saveAssignedTeamsToStorage(tournamentId, [
              values.team1Id,
              values.team2Id,
            ]);
            // Update local state
            setAssignedTeams((prev) => [
              ...new Set([...prev, values.team1Id, values.team2Id]),
            ]);

            message.success('Match created successfully');
            onClose();
            form.resetFields();
            refetch();
          },
          onError: (err) => {
            message.error('Error creating match');
            console.error('Error creating match:', err);
          },
        });
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  const handleTeamChange = (value: number, field: string) => {
    setSelectedTeams((prev) => ({ ...prev, [field]: value }));
  };

  const getFilteredTeams = (excludeKeys: string[]) => {
    const selectedValues = Object.keys(selectedTeams)
      .filter((key) => excludeKeys.includes(key))
      .map((key) => selectedTeams[key]);

    let filteredTeams = tournamentDetails?.registrationDetails?.filter(
      (team) => !selectedValues.includes(team.id)
    );

    // If hideAssignedTeams is true, filter out teams that are in localStorage
    if (hideAssignedTeams && assignedTeams.length > 0) {
      filteredTeams = filteredTeams?.filter(
        (team) => !assignedTeams.includes(team.id)
      );
    }

    return filteredTeams;
  };

  const pairTeamsRandomly = () => {
    // Start with all teams
    let teams = tournamentDetails?.registrationDetails || [];

    // Filter out teams already in localStorage if hideAssignedTeams is true
    if (hideAssignedTeams && assignedTeams.length > 0) {
      teams = teams.filter((team) => !assignedTeams.includes(team.id));
    }

    if (teams.length < 2) {
      message.warning('Not enough teams to pair');
      return;
    }

    // Generate a new random seed each time
    const newSeed = Math.random().toString();
    const rng = seedrandom(newSeed);
    const shuffledTeams = [...teams].sort(() => rng() - 0.5);
    const pairs = [];
    for (let i = 0; i < shuffledTeams.length; i += 2) {
      if (shuffledTeams[i + 1]) {
        pairs.push([shuffledTeams[i], shuffledTeams[i + 1]]);
      }
    }

    if (pairs.length > 0) {
      const [team1, team2] = pairs[0];
      form.setFieldsValue({
        team1Id: team1.id,
        team2Id: team2.id,
      });
      setSelectedTeams({
        team1Id: team1.id,
        team2Id: team2.id,
      });
      message.success('Teams paired successfully');
    } else {
      message.warning('Not enough teams to pair');
    }
  };

  const handleClearAssignedTeams = () => {
    clearAssignedTeamsFromStorage(tournamentId);
    setAssignedTeams([]);
    message.success('Cleared all assigned teams');
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
          isPublic: false,
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
                <Form.Item
                  name="winScore"
                  label="Win Score"
                  rules={[
                    { required: true, message: 'Please select the win score!' },
                  ]}
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
                  rules={[
                    { required: true, message: 'Please input the match date!' },
                  ]}
                >
                  <Input type="datetime-local" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[
                    { required: true, message: 'Please select the status!' },
                  ]}
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
                  rules={[
                    {
                      required: true,
                      message: 'Please select the match category!',
                    },
                  ]}
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
                  rules={[
                    {
                      required: true,
                      message: 'Please select the match format!',
                    },
                  ]}
                >
                  <Select onChange={(value) => setMatchFormat(value)}>
                    {tournamentDetails?.type == '2' ? (
                      <>
                        <Option value={MatchFormat.DoubleFemale}>
                          Double Female
                        </Option>
                        <Option value={MatchFormat.DoubleMix}>
                          Double Mix
                        </Option>
                      </>
                    ) : (
                      <>
                        <Option value={MatchFormat.SingleMale}>
                          Single Male
                        </Option>
                        <Option value={MatchFormat.SingleFemale}>
                          Single Female
                        </Option>
                        <Option value={MatchFormat.DoubleMale}>
                          Double Male
                        </Option>
                      </>
                    )}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: 'Please input the description!' },
              ]}
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
                  rules={[
                    { required: true, message: 'Please select a referee!' },
                  ]}
                >
                  <Select showSearch optionFilterProp="children">
                    {referees?.map((referee) => (
                      <Option key={referee.id} value={referee.id}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img
                            src={referee.avatarUrl}
                            alt="avatar"
                            style={{ width: 20, height: 20, marginRight: 8 }}
                          />
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
                  rules={[
                    { required: true, message: 'Please select a venue!' },
                  ]}
                >
                  <Select showSearch optionFilterProp="children">
                    {venues?.map((venue) => (
                      <Option key={venue.id} value={venue.id}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <img
                            src={venue.urlImage}
                            alt="venue"
                            style={{ width: 20, height: 20, marginRight: 8 }}
                          />
                          <div>{venue.name}</div>
                          <div style={{ fontSize: 'small', color: 'gray' }}>
                            {venue.address}
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Panel>
          <Panel header="Teams" key="3">
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Button type="primary" onClick={pairTeamsRandomly}>
                  Auto Pair Teams
                </Button>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Tooltip title="All teams that have been assigned to matches are saved. Clear this list if you want to reuse teams.">
                  <InfoCircleOutlined style={{ marginRight: 8 }} />
                </Tooltip>
                <Switch
                  checked={hideAssignedTeams}
                  onChange={setHideAssignedTeams}
                  style={{ marginRight: 8 }}
                />
                <span style={{ margin: 8 }}>Hide assigned teams</span>
                <Tooltip title="Are you sure you want to clear all assigned teams?">
                  <Button
                    danger
                    style={{ marginTop: 8 }}
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: 'Confirm Clear',
                        content:
                          'Are you sure you want to clear all assigned teams?',
                        okText: 'Yes',
                        cancelText: 'No',
                        onOk: handleClearAssignedTeams,
                      });
                    }}
                    disabled={assignedTeams.length === 0}
                  >
                    Clear Assigned Teams ({assignedTeams.length})
                  </Button>
                </Tooltip>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="team1Id"
                  label="Team 1"
                  rules={[{ required: true, message: 'Please select team 1!' }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="children"
                    onChange={(value) => handleTeamChange(value, 'team1Id')}
                  >
                    {getFilteredTeams(['team2Id'])?.map((team) => (
                      <Option key={team.id} value={team.id}>
                        {team.playerDetails.firstName}{' '}
                        {team.playerDetails.lastName}
                        {team.partnerDetails &&
                          ` & ${team.partnerDetails.firstName} ${team.partnerDetails.lastName}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="team2Id"
                  label="Team 2"
                  rules={[{ required: true, message: 'Please select team 2!' }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="children"
                    onChange={(value) => handleTeamChange(value, 'team2Id')}
                  >
                    {getFilteredTeams(['team1Id'])?.map((team) => (
                      <Option key={team.id} value={team.id}>
                        {team.playerDetails.firstName}{' '}
                        {team.playerDetails.lastName}
                        {team.partnerDetails &&
                          ` & ${team.partnerDetails.firstName} ${team.partnerDetails.lastName}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Panel>
        </Collapse>
        {isError && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      </Form>
    </Modal>
  );
};

export default AddMatchModal;
