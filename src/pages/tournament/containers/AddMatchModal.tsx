import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Modal,
  Select,
  Collapse,
  Row,
  Col,
  Button,
  message,
  Switch,
  Tooltip,
  Alert,
  Typography,
  Divider,
  Space,
  Badge,
  Card
} from 'antd';
import seedrandom from 'seedrandom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useGetTournamentById } from '../../../modules/Tournaments/hooks/useGetTournamentById';
import { useGetVenueBySponnerId } from '../../../modules/Venues/hooks/useGetVenueBySponnerId';
import { useCreateMatch } from '../../../modules/Macths/hooks/useCreateMatch';
import { useGetMatchByTournamentId } from '../../../modules/Tournaments/hooks/useGetMatchByTournamentId';
import { 
  DeleteOutlined, 
  InfoCircleOutlined, 
  TrophyOutlined, 
  TeamOutlined, 
  SyncOutlined, 
  PlusOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useGetRefereeBySponnerId } from '../../../modules/Refee/hooks/useGetRefereeBySponnerId';
import { 
  MatchFormat, 
  MATCH_FORMAT_NAMES, 
  TOURNAMENT_TYPE_TO_FORMAT,
  MatchCategory,
  MatchStatus,
  WinScore
} from '../../../modules/Macths/constants';

const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Text } = Typography;

// Enum for Match Format to match backend
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
  const [matchFormat, setMatchFormat] = useState<MatchFormat>(MatchFormat.SingleMale);
  const [selectedTeams, setSelectedTeams] = useState<{
    [key: string]: number | undefined;
  }>({});
  const [hideAssignedTeams, setHideAssignedTeams] = useState<boolean>(true);
  const [assignedTeams, setAssignedTeams] = useState<number[]>([]);
  const [dateError, setDateError] = useState<string | null>(null);

  const { data: referees } = useGetRefereeBySponnerId(user?.id?.toString() || '');
  const { data: tournamentDetails, refetch: refetchTournament } = useGetTournamentById(tournamentId);
  const { data: venues } = useGetVenueBySponnerId(user?.id || 0);
  
  const { mutate: createMatch, isError, error } = useCreateMatch();

  // Re-fetch tournament details when tournament ID changes
  useEffect(() => {
    if (tournamentId) {
      refetchTournament();
    }
  }, [tournamentId, refetchTournament]);

  // Determine the correct match format based on tournament type
  useEffect(() => {
    if (tournamentDetails?.type) {
      // Get the appropriate match format from our mapping or default to SingleMale
      const defaultFormat = TOURNAMENT_TYPE_TO_FORMAT[tournamentDetails.type] || MatchFormat.SingleMale;
      
      // Update the state
      setMatchFormat(defaultFormat);
      
      // Set hidden field values that will be included in submission
      form.setFieldsValue({
        matchFormat: defaultFormat,
        matchCategory: MatchCategory.Tournament,
        status: MatchStatus.Scheduled
      });
    }
  }, [tournamentDetails, form]);

  // Load assigned teams from localStorage when component mounts
  useEffect(() => {
    if (tournamentId) {
      const storedTeams = getAssignedTeamsFromStorage(tournamentId);
      setAssignedTeams(storedTeams);
    }
  }, [tournamentId]);

  // Validate match date is within tournament dates
  const validateMatchDate = (matchDate: string): boolean => {
    if (!tournamentDetails?.startDate || !tournamentDetails?.endDate || !matchDate) {
      return false;
    }

    const tournamentStart = new Date(tournamentDetails.startDate);
    const tournamentEnd = new Date(tournamentDetails.endDate);
    const selectedDate = new Date(matchDate);

    if (selectedDate < tournamentStart) {
      setDateError("Match date cannot be before tournament start date");
      return false;
    } 
    
    if (selectedDate > tournamentEnd) {
      setDateError("Match date cannot be after tournament end date");
      return false;
    }

    setDateError(null);
    return true;
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        // Validate match date is within tournament dates
        if (!validateMatchDate(values.matchDate)) {
          return;
        }

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

        // Add hidden fields back to the submission
        const fullValues = {
          ...values,
          matchFormat,
          matchCategory: MatchCategory.Tournament,
          status: MatchStatus.Scheduled
        };

        // Check if the format is Singles (SingleMale=1 or SingleFemale=2)
        if (
          matchFormat === MatchFormat.SingleMale ||
          matchFormat === MatchFormat.SingleFemale
        ) {
          matchData = {
            ...fullValues,
            roomOnwer: user?.id,
            tournamentId,
            player1Id: team1.playerId, // First player from team 1
            player2Id: team2.playerId, // First player from team 2
          };
        } else {
          // Double formats (DoubleMale=3, DoubleFemale=4, DoubleMix=5)
          matchData = {
            ...fullValues,
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
    setDateError(null);
  };

  const handleTeamChange = (value: number, field: string) => {
    setSelectedTeams((prev) => ({ ...prev, [field]: value }));
  };

  const getFilteredTeams = (excludeKeys: string[]) => {
    const selectedValues = Object.keys(selectedTeams)
      .filter((key) => excludeKeys.includes(key))
      .map((key) => selectedTeams[key]);

    // Filter by approval status: only teams with isApproved === 2
    let filteredTeams = tournamentDetails?.registrationDetails?.filter(
      (team) => 
        team.isApproved === 2 && // Only approved teams
        !selectedValues.includes(team.id)
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

    // Filter for approved teams (isApproved === 2)
    teams = teams.filter(team => team.isApproved === 2);

    // Filter out teams already in localStorage if hideAssignedTeams is true
    if (hideAssignedTeams && assignedTeams.length > 0) {
      teams = teams.filter((team) => !assignedTeams.includes(team.id));
    }

    if (teams.length < 2) {
      message.warning('Not enough eligible teams to pair');
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
      message.warning('Not enough eligible teams to pair');
    }
  };

  const handleClearAssignedTeams = () => {
    clearAssignedTeamsFromStorage(tournamentId);
    setAssignedTeams([]);
    message.success('Cleared all assigned teams');
  };

  return (
    <Modal
      title={
        <Space>
          <TrophyOutlined />
          <span>Create New Match</span>
        </Space>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      destroyOnClose={true}
      okText="Create Match"
      okButtonProps={{
        icon: <PlusOutlined />
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: 'PickerPall champion',
          description: 'This is a sample description for the match.',
          isPublic: false,
          winScore: WinScore.ElevenPoints,
        }}
        key={`match-form-${tournamentId}`}
      >
        {/* Tournament info header */}
        {tournamentDetails && (
          <Alert
            type="info"
            showIcon
            message={
              <Space>
                <Text strong>{tournamentDetails.name}</Text>
                <Badge 
                  status={tournamentDetails.status === 'Ongoing' ? 'processing' : 'default'} 
                  text={tournamentDetails.status} 
                />
              </Space>
            }
            description={
              <Space direction="vertical" size="small">
                <Text type="secondary">
                  <CalendarOutlined /> Tournament Period: {new Date(tournamentDetails.startDate).toLocaleDateString()} - {new Date(tournamentDetails.endDate).toLocaleDateString()}
                </Text>
                <Text type="secondary">
                  Match Format: {MATCH_FORMAT_NAMES[matchFormat]}
                </Text>
              </Space>
            }
            style={{ marginBottom: 16 }}
          />
        )}

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
                    <Option value={WinScore.ElevenPoints}>11</Option>
                    <Option value={WinScore.FifteenPoints}>15</Option>
                    <Option value={WinScore.TwentyOnePoints}>21</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="matchDate"
                  label="Match Date"
                  rules={[
                    { required: true, message: 'Please input the match date!' },
                  ]}
                  validateStatus={dateError ? "error" : ""}
                  help={dateError}
                >
                  <Input 
                    type="datetime-local" 
                    onChange={(e) => validateMatchDate(e.target.value)}
                  />
                </Form.Item>
                {tournamentDetails && (
                  <Text type="secondary" style={{ display: 'block', marginTop: -8, marginBottom: 16 }}>
                    <InfoCircleOutlined style={{ marginRight: 4 }} />
                    Match date must be between tournament dates: {new Date(tournamentDetails.startDate).toLocaleDateString()} - {new Date(tournamentDetails.endDate).toLocaleDateString()}
                  </Text>
                )}
              </Col>
            </Row>
            
            {/* Hidden fields - not shown in UI but values will be submitted */}
            <div style={{ display: 'none' }}>
              <Form.Item name="matchFormat">
                <Input />
              </Form.Item>
              <Form.Item name="matchCategory">
                <Input />
              </Form.Item>
              <Form.Item name="status">
                <Input />
              </Form.Item>
            </div>
            
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
                      <Option key={referee.user.id} value={referee.user.id}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img
                            src={referee.user.avatarUrl}
                            alt="avatar"
                            style={{ width: 20, height: 20, marginRight: 8 }}
                          />
                          {referee.user.firstName} {referee.user.lastName}
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
          <Panel 
            header={
              <Space>
                <TeamOutlined />
                <span>Create New Round</span>
              </Space>
            } 
            key="3"
          >
            <Alert 
              message="Team Selection" 
              description={
                <div>
                  Only approved teams (status: Approved) are available for selection. 
                  {assignedTeams.length > 0 && <Text strong> {assignedTeams.length} teams</Text>} have been assigned to matches.
                </div>
              } 
              type="info" 
              showIcon 
              style={{ marginBottom: 16 }} 
            />

            <Card 
              size="small" 
              title="Match Teams" 
              style={{ marginBottom: 16 }}
              extra={
                <Space>
                  <Tooltip title="Only show teams that haven't been used in other matches">
                    <Switch
                      checked={hideAssignedTeams}
                      onChange={setHideAssignedTeams}
                      size="small"
                    />
                    <Text style={{ marginLeft: 8, fontSize: 12 }}>Hide assigned teams</Text>
                  </Tooltip>
                </Space>
              }
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Space wrap>
                    <Button 
                      type="primary" 
                      onClick={pairTeamsRandomly}
                      icon={<SyncOutlined />}
                    >
                      Random Pairing
                    </Button>
                    {assignedTeams.length > 0 && (
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          Modal.confirm({
                            title: 'Clear Assigned Teams',
                            content:
                              'This will allow all teams to be available for selection again. Continue?',
                            okText: 'Clear',
                            cancelText: 'Cancel',
                            onOk: handleClearAssignedTeams,
                          });
                        }}
                      >
                        Reset Assignment History ({assignedTeams.length})
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>

              <Divider style={{ margin: '12px 0' }} />
                
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
                      placeholder="Select first team"
                      notFoundContent={hideAssignedTeams ? "No more available teams. Try disabling 'Hide assigned teams'." : "No approved teams available"}
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
                      placeholder="Select second team"
                      notFoundContent={hideAssignedTeams ? "No more available teams. Try disabling 'Hide assigned teams'." : "No approved teams available"}
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
            </Card>
          </Panel>
        </Collapse>
        {isError && <Alert message={`Error: ${error.message}`} type="error" showIcon style={{ marginTop: 16 }} />}
      </Form>
    </Modal>
  );
};

export default AddMatchModal;
