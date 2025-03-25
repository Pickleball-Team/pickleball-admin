import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Typography,
  Button,
  Form,
  InputNumber,
  Select,
  Input,
  Card,
  Row,
  Col,
  Space,
  Tabs,
  Tag,
  message,
  Divider,
} from 'antd';
import {
  TrophyOutlined,
  PlusOutlined,
  SaveOutlined,
  EditOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  IMatch,
  EndTournamentMatchDTO,
  IMatchScope,
} from '../../../modules/Macths/models';
import { useEndTournamentMatch } from '../../../modules/Macths/hooks/useEndTournamentMatch';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// Sample data for match scores
const SAMPLE_MATCH_SCORES = [
  {
    matchScoreId: 1,
    matchId: 3,
    round: 1,
    note: 'First round, Team 1 started strong',
    currentHaft: 1,
    team1Score: 11,
    team2Score: 7,
  },
  {
    matchScoreId: 2,
    matchId: 3,
    round: 2,
    note: 'Second round, Team 2 made a comeback',
    currentHaft: 1,
    team1Score: 9,
    team2Score: 11,
  },
  {
    matchScoreId: 3,
    matchId: 3,
    round: 3,
    note: 'Final round, Team 1 won in a close finish',
    currentHaft: 1,
    team1Score: 11,
    team2Score: 9,
  },
];

interface MatchScoreModalProps {
  visible: boolean;
  onClose: () => void;
  match: IMatch;
  refetch: () => void;
}

const MatchScoreModal: React.FC<MatchScoreModalProps> = ({
  visible,
  onClose,
  match,
  refetch,
}) => {
  const [matchScores, setMatchScores] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('viewScores');
  const [editingRound, setEditingRound] = useState<number | null>(null);
  const [form] = Form.useForm();
  const { mutateAsync: endMatch, status } = useEndTournamentMatch();
  
  // Add state for referee scoring tab
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSet, setCurrentSet] = useState(1);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [setScores, setSetScores] = useState<Array<{set: number, team1: number, team2: number}>>([]);
  const [gamePoint, setGamePoint] = useState<number | null>(null);
  const [scoringHistory, setScoringHistory] = useState<Array<{team: number, points: number, timestamp: string}>>([]);

  // Fetch match scores
  useEffect(() => {
    // In a real scenario, we would fetch data from an API
    // For now, we'll use sample data if the match ID matches
    if (match?.id === 3) {
      setMatchScores(SAMPLE_MATCH_SCORES);
    } else {
      // For other match IDs, create empty sample data
      setMatchScores([
        {
          matchScoreId: 100 + match?.id,
          matchId: match?.id,
          round: 1,
          note: 'First round',
          currentHaft: 1,
          team1Score: 0,
          team2Score: 0,
        },
      ]);
    }
  }, [match?.id]);

  // Handle ending the match
  const handleEndMatch = async (values: any) => {
    try {
      // Show loading message
      const loadingMessage = message.loading('Submitting match scores...', 0);

      // Create an array of promises for each round score
      const scorePromises = matchScores.map((score) => {
        const scoreData: EndTournamentMatchDTO = {
          matchId: match.id,
          round: score.round,
          note: score.note,
          currentHaft: score.currentHaft,
          team1Score: score.team1Score,
          team2Score: score.team2Score,
        };

        return endMatch(scoreData);
      });

      // Add final summary data
      const finalData: EndTournamentMatchDTO = {
        matchId: match.id,
        round: values.round,
        note: values.note,
        currentHaft: values.currentHaft,
        team1Score: values.team1Score,
        team2Score: values.team2Score,
      };

      scorePromises.push(endMatch(finalData));

      // Execute all promises in parallel
      await Promise.all(scorePromises);

      // Close loading message
      loadingMessage();

      // Show success message
      message.success('Match ended successfully');

      // Close modal and refresh data
      onClose();
      refetch();
    } catch (error: any) {
      message.error(`Failed to end match: ${error.message}`);
    }
  };

  // Add a new round score
  const handleAddRound = (values: any) => {
    const newScore = {
      matchScoreId: Math.floor(Math.random() * 1000) + 100, // Fake ID for demo
      matchId: match.id,
      round: matchScores.length + 1,
      note: values.note,
      currentHaft: values.currentHaft,
      team1Score: values.team1Score,
      team2Score: values.team2Score,
    };

    setMatchScores([...matchScores, newScore]);
    message.success('New round score added');
    form.resetFields();
    setActiveTab('viewScores');
  };

  // Edit an existing round score
  const handleEditRound = (values: any) => {
    const updatedScores = matchScores.map((score) =>
      score.round === editingRound
        ? {
            ...score,
            note: values.note,
            currentHaft: values.currentHaft,
            team1Score: values.team1Score,
            team2Score: values.team2Score,
          }
        : score
    );

    setMatchScores(updatedScores);
    setEditingRound(null);
    message.success('Round score updated');
  };

  const startEditRound = (round: number) => {
    const scoreToEdit = matchScores.find((score) => score.round === round);
    if (scoreToEdit) {
      form.setFieldsValue({
        round: scoreToEdit.round,
        note: scoreToEdit.note,
        currentHaft: scoreToEdit.currentHaft,
        team1Score: scoreToEdit.team1Score,
        team2Score: scoreToEdit.team2Score,
      });
      setEditingRound(round);
      setActiveTab('addScore');
    }
  };

  // Calculate total scores
  const totalScores = matchScores.reduce(
    (acc, score) => {
      return {
        team1: acc.team1 + score.team1Score,
        team2: acc.team2 + score.team2Score,
      };
    },
    { team1: 0, team2: 0 }
  );

  // Determine winner
  const winner =
    totalScores.team1 > totalScores.team2
      ? 'Team 1'
      : totalScores.team2 > totalScores.team1
        ? 'Team 2'
        : 'Tie';

  const columns = [
    {
      title: 'Round',
      dataIndex: 'round',
      key: 'round',
      render: (round: number) => <Tag color="blue">{`Round ${round}`}</Tag>,
    },
    {
      title: 'Team 1 Score',
      dataIndex: 'team1Score',
      key: 'team1Score',
      render: (score: number) => (
        <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
          {score}
        </Text>
      ),
    },
    {
      title: 'Team 2 Score',
      dataIndex: 'team2Score',
      key: 'team2Score',
      render: (score: number) => (
        <Text strong style={{ fontSize: '16px', color: '#fa8c16' }}>
          {score}
        </Text>
      ),
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: IMatchScope) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => startEditRound(record.round)}
          type="link"
        >
          Edit
        </Button>
      ),
    },
  ];

  // Helper function to add points to a team
  const addPointToTeam = (team: number, points: number = 1) => {
    if (team === 1) {
      setTeam1Score(prev => prev + points);
    } else {
      setTeam2Score(prev => prev + points);
    }
    
    // Add to scoring history
    setScoringHistory(prev => [
      ...prev,
      {
        team,
        points,
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Check for game point
    const newTeam1Score = team === 1 ? team1Score + points : team1Score;
    const newTeam2Score = team === 2 ? team2Score + points : team2Score;
    
    if (newTeam1Score >= 10 && newTeam1Score >= newTeam2Score + 2) {
      setGamePoint(1);
    } else if (newTeam2Score >= 10 && newTeam2Score >= newTeam1Score + 2) {
      setGamePoint(2);
    } else {
      setGamePoint(null);
    }
  };
  
  // Finalize the current set
  const finalizeSet = () => {
    // Save the current set score
    setSetScores(prev => [
      ...prev,
      {
        set: currentSet,
        team1: team1Score,
        team2: team2Score
      }
    ]);
    
    // Reset scores for next set
    setTeam1Score(0);
    setTeam2Score(0);
    setGamePoint(null);
    setCurrentSet(prev => prev + 1);
    
    message.success(`Set ${currentSet} completed and saved`);
  };
  
  // Submit round scores
  const submitRoundScores = async () => {
    try {
      // First finalize any current set if there are points
      if (team1Score > 0 || team2Score > 0) {
        finalizeSet();
      }
      
      if (setScores.length === 0) {
        message.warning('Please score at least one set before submitting');
        return;
      }
      
      // Calculate total scores for the round
      const roundTotal = setScores.reduce(
        (acc, set) => {
          return {
            team1: acc.team1 + set.team1,
            team2: acc.team2 + set.team2
          };
        },
        { team1: 0, team2: 0 }
      );
      
      // Prepare new score data
      const newScore = {
        matchScoreId: Math.floor(Math.random() * 1000) + 100,
        matchId: match.id,
        round: currentRound,
        note: `Round ${currentRound}: ${setScores.length} sets played`,
        currentHaft: 1,
        team1Score: roundTotal.team1,
        team2Score: roundTotal.team2,
      };
      
      // Add to match scores
      setMatchScores([...matchScores, newScore]);
      
      // Reset for next round
      setCurrentRound(prev => prev + 1);
      setCurrentSet(1);
      setSetScores([]);
      setScoringHistory([]);
      
      message.success('Round scores submitted successfully');
      setActiveTab('viewScores');
    } catch (error) {
      message.error('Failed to submit round scores');
    }
  };
  
  // Undo last scoring action
  const undoLastScore = () => {
    if (scoringHistory.length === 0) return;
    
    const lastAction = scoringHistory[scoringHistory.length - 1];
    if (lastAction.team === 1) {
      setTeam1Score(prev => prev - lastAction.points);
    } else {
      setTeam2Score(prev => prev - lastAction.points);
    }
    
    setScoringHistory(prev => prev.slice(0, -1));
  };

  // Calculate sets won by each team
  const setsWon = setScores.reduce(
    (acc, set) => {
      if (set.team1 > set.team2) {
        return { ...acc, team1: acc.team1 + 1 };
      } else if (set.team2 > set.team1) {
        return { ...acc, team2: acc.team2 + 1 };
      }
      return acc;
    },
    { team1: 0, team2: 0 }
  );

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrophyOutlined style={{ color: '#faad14', fontSize: '20px' }} />
          <span>Match Scores - {match?.title}</span>
        </div>
      }
      visible={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <TeamOutlined /> View Scores
            </span>
          }
          key="viewScores"
        >
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card bordered={false} style={{ background: '#f0f8ff' }}>
                <Statistic
                  title="Team 1 Total"
                  value={totalScores.team1}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} style={{ background: '#fffbe6' }}>
                <Statistic
                  title="Team 2 Total"
                  value={totalScores.team2}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} style={{ background: '#f6ffed' }}>
                <Statistic
                  title="Winner"
                  value={winner}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Table
            dataSource={matchScores}
            columns={columns}
            rowKey="matchScoreId"
            pagination={false}
            expandable={{
              expandedRowRender: (record) => (
                <p style={{ margin: 0 }}>
                  <Text strong>Full zNote:</Text> {record.note}
                </p>
              ),
            }}
          />

          <Divider />

          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setEditingRound(null);
                setActiveTab('addScore');
              }}
            >
              Add Round Score
            </Button>
            <Button
              type="primary"
              danger
              icon={<CheckCircleOutlined />}
              onClick={() => setActiveTab('endMatch')}
            >
              End Match
            </Button>
          </Space>
        </TabPane>

        <TabPane
          tab={
            <span>
              <PlusOutlined /> {editingRound ? 'Edit' : 'Add'} Score
            </span>
          }
          key="addScore"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={editingRound ? handleEditRound : handleAddRound}
            initialValues={{
              round: matchScores.length + 1,
              currentHaft: 1,
              team1Score: 0,
              team2Score: 0,
              note: '',
            }}
          >
            {editingRound && (
              <Form.Item name="round" hidden>
                <InputNumber />
              </Form.Item>
            )}

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="team1Score"
                  label="Team 1 Score"
                  rules={[
                    { required: true, message: 'Please enter Team 1 score' },
                  ]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="team2Score"
                  label="Team 2 Score"
                  rules={[
                    { required: true, message: 'Please enter Team 2 score' },
                  ]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="currentHaft"
              label="Current Half"
              rules={[
                { required: true, message: 'Please select the current half' },
              ]}
            >
              <Select>
                <Option value={1}>First Half</Option>
                <Option value={2}>Second Half</Option>
                <Option value={3}>Overtime</Option>
              </Select>
            </Form.Item>

            <Form.Item name="note" label="Notes">
              <TextArea
                rows={4}
                placeholder="Add any notes about this round..."
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                >
                  {editingRound ? 'Update Score' : 'Add Score'}
                </Button>
                <Button onClick={() => setActiveTab('viewScores')}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane
          tab={
            <span>
              <CheckCircleOutlined /> End Match
            </span>
          }
          key="endMatch"
        >
          <Alert
            message="End Match Confirmation"
            description="Ending the match will finalize the scores and update the tournament brackets. This action cannot be undone."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* Added score summary section */}
          <div style={{ marginBottom: 24 }}>
            <Title level={4}>Score Summary</Title>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card bordered={false} style={{ background: '#f0f8ff' }}>
                  <Statistic
                    title="Team 1 Total"
                    value={totalScores.team1}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false} style={{ background: '#fffbe6' }}>
                  <Statistic
                    title="Team 2 Total"
                    value={totalScores.team2}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false} style={{ background: '#f6ffed' }}>
                  <Statistic
                    title="Winner"
                    value={winner}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<TrophyOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Table
              dataSource={matchScores}
              columns={columns.filter((col) => col.key !== 'actions')}
              rowKey="matchScoreId"
              pagination={false}
              size="small"
            />

            <Divider />
          </div>

          <Space>
            <Button
              type="primary"
              danger
              htmlType="submit"
              icon={<CheckCircleOutlined />}
              onClick={handleEndMatch}
            >
              Confirm End Match
            </Button>
            <Button onClick={() => setActiveTab('viewScores')}>Cancel</Button>
          </Space>
        </TabPane>

        {/* New Referee Scoring Tab */}
        <TabPane
          tab={
            <span>
              <TeamOutlined /> Referee Scoring
            </span>
          }
          key="refereeScoring"
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3}>
              Round {currentRound} - Set {currentSet}
            </Title>
            
            {gamePoint && (
              <Tag color="red" style={{ fontSize: '16px', padding: '5px 10px', marginBottom: 16 }}>
                Game Point - Team {gamePoint}
              </Tag>
            )}
            
            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Card 
                  bordered 
                  style={{ 
                    background: '#f0f8ff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                      <Text style={{ fontSize: '16px' }}>Team 1</Text>
                      <div style={{ 
                        fontSize: '48px', 
                        fontWeight: 'bold', 
                        color: '#1890ff',
                        margin: '10px 0'
                      }}>
                        {team1Score}
                      </div>
                      <Text>Sets won: {setsWon.team1}</Text>
                    </div>
                    
                    <Space>
                      <Button 
                        type="primary" 
                        size="large"
                        style={{ height: '60px', width: '100px', fontSize: '24px' }}
                        onClick={() => addPointToTeam(1)}
                      >
                        +1
                      </Button>
                      <Button 
                        size="large"
                        style={{ height: '60px', width: '60px' }}
                        onClick={() => addPointToTeam(1, -1)}
                        disabled={team1Score <= 0}
                      >
                        -1
                      </Button>
                    </Space>
                  </Space>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card 
                  bordered 
                  style={{ 
                    background: '#fffbe6',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                      <Text style={{ fontSize: '16px' }}>Team 2</Text>
                      <div style={{ 
                        fontSize: '48px', 
                        fontWeight: 'bold', 
                        color: '#fa8c16',
                        margin: '10px 0'
                      }}>
                        {team2Score}
                      </div>
                      <Text>Sets won: {setsWon.team2}</Text>
                    </div>
                    
                    <Space>
                      <Button 
                        type="primary" 
                        size="large"
                        style={{ 
                          height: '60px', 
                          width: '100px', 
                          fontSize: '24px',
                          background: '#fa8c16',
                          borderColor: '#fa8c16'
                        }}
                        onClick={() => addPointToTeam(2)}
                      >
                        +1
                      </Button>
                      <Button 
                        size="large"
                        style={{ height: '60px', width: '60px' }}
                        onClick={() => addPointToTeam(2, -1)}
                        disabled={team2Score <= 0}
                      >
                        -1
                      </Button>
                    </Space>
                  </Space>
                </Card>
              </Col>
            </Row>
            
            <Space style={{ marginBottom: 24 }}>
              <Button 
                type="default" 
                icon={<SaveOutlined />} 
                onClick={finalizeSet}
                disabled={team1Score === 0 && team2Score === 0}
                size="large"
              >
                End Set & Save
              </Button>
              
              <Button 
                onClick={undoLastScore}
                disabled={scoringHistory.length === 0}
                icon={<EditOutlined />}
                size="large"
              >
                Undo Last Score
              </Button>
            </Space>
          </div>
          
          {/* Sets Summary */}
          {setScores.length > 0 && (
            <>
              <Divider orientation="left">Set Scores</Divider>
              <Table
                dataSource={setScores}
                pagination={false}
                rowKey="set"
                size="middle"
                columns={[
                  {
                    title: 'Set',
                    dataIndex: 'set',
                    key: 'set',
                    render: (set) => <Tag color="blue">{`Set ${set}`}</Tag>,
                  },
                  {
                    title: 'Team 1',
                    dataIndex: 'team1',
                    key: 'team1',
                    render: (score) => (
                      <Text strong style={{ color: '#1890ff' }}>{score}</Text>
                    ),
                  },
                  {
                    title: 'Team 2',
                    dataIndex: 'team2',
                    key: 'team2',
                    render: (score) => (
                      <Text strong style={{ color: '#fa8c16' }}>{score}</Text>
                    ),
                  },
                  {
                    title: 'Winner',
                    key: 'winner',
                    render: (_, record) => (
                      <Text strong style={{ 
                        color: record.team1 > record.team2 ? '#1890ff' : record.team2 > record.team1 ? '#fa8c16' : '#000'
                      }}>
                        {record.team1 > record.team2 
                          ? 'Team 1' 
                          : record.team2 > record.team1 
                            ? 'Team 2' 
                            : 'Tie'}
                      </Text>
                    ),
                  },
                ]}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <Text strong>Total</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong style={{ color: '#1890ff' }}>
                        {setScores.reduce((acc, curr) => acc + curr.team1, 0)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Text strong style={{ color: '#fa8c16' }}>
                        {setScores.reduce((acc, curr) => acc + curr.team2, 0)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      <Text strong>
                        Sets: {setsWon.team1} - {setsWon.team2}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </>
          )}
          
          <Divider />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={submitRoundScores}
                disabled={setScores.length === 0 && team1Score === 0 && team2Score === 0}
                size="large"
              >
                Submit Round Score
              </Button>
              <Button onClick={() => setActiveTab('viewScores')}>
                Cancel
              </Button>
            </Space>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

// Add Statistic component that we used in our modal
const Statistic = ({ title, value, valueStyle, prefix }: any) => {
  return (
    <div>
      <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}>
        {title}
      </div>
      <div style={{ fontSize: '24px', ...valueStyle }}>
        {prefix && <span style={{ marginRight: '8px' }}>{prefix}</span>}
        {value}
      </div>
    </div>
  );
};

// Updated Alert component with correct warning icon
const Alert = ({ message, description, type, showIcon, style }: any) => {
  const getIconByType = () => {
    if (type === 'warning')
      return <WarningOutlined style={{ color: '#faad14' }} />;
    return null;
  };

  const getBgColor = () => {
    if (type === 'warning') return '#fffbe6';
    return '#fff';
  };

  return (
    <div
      style={{
        padding: '15px',
        backgroundColor: getBgColor(),
        border: `1px solid ${type === 'warning' ? '#faad14' : '#d9d9d9'}`,
        borderRadius: '2px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {showIcon && (
          <div style={{ marginRight: '12px', fontSize: '16px' }}>
            {getIconByType()}
          </div>
        )}
        <div>
          <div style={{ marginBottom: '4px', fontWeight: 500 }}>{message}</div>
          <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{description}</div>
        </div>
      </div>
    </div>
  );
};

export default MatchScoreModal;
