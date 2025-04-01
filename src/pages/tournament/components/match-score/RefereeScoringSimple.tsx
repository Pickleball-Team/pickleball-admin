import React from 'react';
import { Typography, Card, Row, Col, Space, Button, Tag, Divider, Select, Input, Alert, Timeline } from 'antd';
import { SaveOutlined, EditOutlined, TrophyOutlined, ReloadOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface RefereeScoringSimpleProps {
  currentRound: number;
  team1Score: number;
  team2Score: number;
  gamePoint: number | null;
  refereeNotes: string;
  refereeCurrentHalf: number;
  targetScore: number;
  overtimeLimit: number;
  hasWinner: () => number | null;
  onAddPoint: (team: number, points?: number) => void;
  onSetRefereeNotes: (notes: string) => void;
  onSetRefereeCurrentHalf: (half: number) => void;
  onSubmitScores: () => void;
  onUndoLastScore: () => void;
  onCancel: () => void;
  canUndo: boolean;
  onResetScores: () => void;
  scoringHistory: { team: number; points: number; timestamp: string }[];
  disableSubmit?: boolean; // Add this new prop
}

const RefereeScoringSimple: React.FC<RefereeScoringSimpleProps> = ({
  currentRound,
  team1Score,
  team2Score,
  gamePoint,
  refereeNotes,
  refereeCurrentHalf,
  targetScore,
  overtimeLimit,
  hasWinner,
  onAddPoint,
  onSetRefereeNotes,
  onSetRefereeCurrentHalf,
  onSubmitScores,
  onUndoLastScore,
  onCancel,
  canUndo,
  onResetScores,
  scoringHistory,
  disableSubmit = false, // Add default value
}) => {
  const winner = hasWinner();
  const inOvertime = team1Score >= targetScore || team2Score >= targetScore;

  const getTeamProgress = (teamScore: number, teamNum: number) => {
    if (teamScore === 0) return '';
    if (winner === teamNum) return 'WINNER!';
    if (inOvertime) return 'OVERTIME';
    return `${targetScore - teamScore} to win`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3}>Round {currentRound}</Title>

        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Target Score: {targetScore} | Overtime Limit: {overtimeLimit}
          </Text>
        </div>

        {winner && (
          <Alert
            message={`Team ${winner} has won the round!`}
            description="You can now submit the round score."
            type="success"
            showIcon
            icon={<TrophyOutlined />}
            style={{ marginBottom: 16 }}
            action={
              <Button
                type="primary"
                onClick={onSubmitScores}
                icon={<SaveOutlined />}
              >
                Submit Now
              </Button>
            }
          />
        )}

        {gamePoint && !winner && (
          <Tag
            color="red"
            style={{ fontSize: '16px', padding: '5px 10px', marginBottom: 16 }}
          >
            Game Point - Team {gamePoint}
          </Tag>
        )}

        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card
              bordered
              style={{
                background: winner === 1 ? '#d4f7e6' : '#f0f8ff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text style={{ fontSize: '16px' }}>Team 1</Text>
                  <div
                    style={{
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: winner === 1 ? '#52c41a' : '#1890ff',
                      margin: '10px 0',
                    }}
                  >
                    {team1Score}
                  </div>
                  <Text
                    type={winner === 1 ? 'success' : 'secondary'}
                    strong={winner === 1}
                  >
                    {getTeamProgress(team1Score, 1)}
                  </Text>
                </div>

                <Space>
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      height: '60px',
                      width: '100px',
                      fontSize: '24px',
                    }}
                    onClick={() => onAddPoint(1)}
                    disabled={!!winner}
                  >
                    +1
                  </Button>
                  <Button
                    size="large"
                    style={{ height: '60px', width: '60px' }}
                    onClick={() => onAddPoint(1, -1)}
                    disabled={team1Score <= 0 || !!winner}
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
                background: winner === 2 ? '#d4f7e6' : '#fffbe6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text style={{ fontSize: '16px' }}>Team 2</Text>
                  <div
                    style={{
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: winner === 2 ? '#52c41a' : '#fa8c16',
                      margin: '10px 0',
                    }}
                  >
                    {team2Score}
                  </div>
                  <Text
                    type={winner === 2 ? 'success' : 'secondary'}
                    strong={winner === 2}
                  >
                    {getTeamProgress(team2Score, 2)}
                  </Text>
                </div>

                <Space>
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      height: '60px',
                      width: '100px',
                      fontSize: '24px',
                      background: winner === 2 ? '#52c41a' : '#fa8c16',
                      borderColor: winner === 2 ? '#52c41a' : '#fa8c16',
                    }}
                    onClick={() => onAddPoint(2)}
                    disabled={!!winner}
                  >
                    +1
                  </Button>
                  <Button
                    size="large"
                    style={{ height: '60px', width: '60px' }}
                    onClick={() => onAddPoint(2, -1)}
                    disabled={team2Score <= 0 || !!winner}
                  >
                    -1
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card bordered style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Current Half</Text>
                  </div>
                  <Select
                    value={refereeCurrentHalf}
                    onChange={onSetRefereeCurrentHalf}
                    style={{ width: '100%' }}
                  >
                    <Option value={1}>First Half</Option>
                    <Option value={2}>Second Half</Option>
                    <Option value={3}>Overtime</Option>
                  </Select>
                </Col>
                <Col span={16}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Notes</Text>
                  </div>
                  <TextArea
                    autoSize={{ minRows: 1, maxRows: 6 }}
                    value={refereeNotes}
                    onChange={(e) => onSetRefereeNotes(e.target.value)}
                    placeholder="Add notes about this round..."
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {scoringHistory.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <Divider orientation="left">Current Round Scoring History</Divider>
            <Card bordered>
              <Timeline style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {scoringHistory.map((log, index) => (
                  <Timeline.Item
                    key={index}
                    color={log.team === 1 ? 'blue' : 'orange'}
                    dot={
                      log.points > 0 ? undefined : (
                        <ClockCircleOutlined style={{ fontSize: '16px' }} />
                      )
                    }
                  >
                    <Space>
                      <Tag color={log.team === 1 ? 'blue' : 'orange'}>
                        Team {log.team}
                      </Tag>
                      <Text type={log.points > 0 ? 'success' : 'danger'}>
                        {log.points > 0 ? `+${log.points}` : log.points}
                      </Text>
                      <Text type="secondary">{formatTimestamp(log.timestamp)}</Text>
                    </Space>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </div>
        )}

        {disableSubmit && (
          <Alert
            message="Cannot Add More Rounds"
            description="This match has reached the maximum number of allowed rounds."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Space style={{ marginBottom: 24 }}>
          <Button
            onClick={onUndoLastScore}
            disabled={!canUndo || !!winner}
            icon={<EditOutlined />}
            size="large"
          >
            Undo Last Score
          </Button>

          <Button
            onClick={onResetScores}
            icon={<ReloadOutlined />}
            size="large"
            type="default"
            danger
          >
            Reset Scores
          </Button>
        </Space>
      </div>

      <Divider />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={onSubmitScores}
            disabled={
              disableSubmit || (team1Score === 0 && team2Score === 0) || !winner
            }
            size="large"
            title={
              disableSubmit
                ? "Maximum rounds reached"
                : (team1Score === 0 && team2Score === 0)
                ? "Cannot submit with no points"
                : !winner
                ? "No winner yet"
                : "Submit round score"
            }
          >
            Submit Round Score
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </div>
    </>
  );
};

export default RefereeScoringSimple;
