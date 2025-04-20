import React from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Space,
  Button,
  Tag,
  Divider,
  Select,
  Input,
  Alert,
  Timeline,
} from 'antd';
import {
  SaveOutlined,
  EditOutlined,
  TrophyOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useMatchRealtimeLogs } from '../../../../modules/Macths/hooks/useMatchRealtimeLogs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface RefereeScoringSimpleProps {
  matchId: number; // 👈 THÊM MỚI
  currentRound: number;
  gamePoint: number | null;
  refereeNotes: string;
  refereeCurrentHalf: number;
  targetScore: number;
  overtimeLimit: number;
  hasWinner: () => number | null;
  onSetRefereeNotes: (notes: string) => void;
  onSetRefereeCurrentHalf: (half: number) => void;
  onSubmitScores: () => void;
  onCancel: () => void;
  disableSubmit?: boolean;
}

const RefereeScoringSimple: React.FC<RefereeScoringSimpleProps> = ({
  matchId,
  currentRound,
  gamePoint,
  refereeNotes,
  refereeCurrentHalf,
  targetScore,
  overtimeLimit,
  hasWinner,
  onSetRefereeNotes,
  onSetRefereeCurrentHalf,
  onSubmitScores,
  onCancel,
  disableSubmit = false,
}) => {
  const { logs, addLog, undoLastLog } = useMatchRealtimeLogs(
    matchId,
    refereeCurrentHalf
  );

  const team1Score = logs.filter((log) => log.team === 1).reduce((sum, log) => sum + log.points, 0);
  const team2Score = logs.filter((log) => log.team === 2).reduce((sum, log) => sum + log.points, 0);

  const winner = hasWinner?.() || (team1Score >= targetScore ? 1 : team2Score >= targetScore ? 2 : null);
  const inOvertime = team1Score >= targetScore || team2Score >= targetScore;

  const getTeamProgress = (score: number, team: number) => {
    if (score === 0) return '';
    if (winner === team) return 'WINNER!';
    if (inOvertime) return 'OVERTIME';
    return `${targetScore - score} to win`;
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
        <Title level={3}>Round {refereeCurrentHalf}</Title>
        <Text type="secondary">
          Target Score: {targetScore} | Overtime Limit: {overtimeLimit}
        </Text>

        {winner && (
          <Alert
            message={`Team ${winner} has won the round!`}
            type="success"
            showIcon
            icon={<TrophyOutlined />}
            style={{ marginTop: 16 }}
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
          <Tag color="red" style={{ fontSize: '16px', padding: '5px 10px', marginTop: 16 }}>
            Game Point - Team {gamePoint}
          </Tag>
        )}

        <Row gutter={24} style={{ marginTop: 24 }}>
          {[1, 2].map((team) => (
            <Col span={12} key={team}>
              <Card
                bordered
                style={{
                  background: winner === team ? '#d4f7e6' : team === 1 ? '#f0f8ff' : '#fffbe6',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text style={{ fontSize: '16px' }}>Team {team}</Text>
                    <div style={{
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: winner === team ? '#52c41a' : team === 1 ? '#1890ff' : '#fa8c16',
                      margin: '10px 0',
                    }}>
                      {team === 1 ? team1Score : team2Score}
                    </div>
                    <Text
                      type={winner === team ? 'success' : 'secondary'}
                      strong={winner === team}
                    >
                      {getTeamProgress(team === 1 ? team1Score : team2Score, team)}
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
                      onClick={() => addLog(team)}
                      disabled={!!winner}
                    >
                      +1
                    </Button>
                    <Button
                      size="large"
                      style={{ height: '60px', width: '60px' }}
                      onClick={() => addLog(team, -1)}
                      disabled={(team === 1 ? team1Score : team2Score) <= 0 || !!winner}
                    >
                      -1
                    </Button>
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Card style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Current Half</Text>
              <Select
                value={refereeCurrentHalf}
                onChange={onSetRefereeCurrentHalf}
                style={{ width: '100%', marginTop: 8 }}
              >
                <Option value={1}>First Half</Option>
                <Option value={2}>Second Half</Option>
                <Option value={3}>Overtime</Option>
              </Select>
            </Col>
            <Col span={16}>
              <Text strong>Notes</Text>
              <TextArea
                autoSize={{ minRows: 1, maxRows: 4 }}
                value={refereeNotes}
                onChange={(e) => onSetRefereeNotes(e.target.value)}
                placeholder="Write any referee notes here..."
                style={{ marginTop: 8 }}
              />
            </Col>
          </Row>
        </Card>

        <Divider orientation="left">Scoring History</Divider>
        <Card>
          <Timeline style={{ maxHeight: 200, overflowY: 'auto' }}>
            {logs.map((log, index) => (
              <Timeline.Item
                key={index}
                color={log.team === 1 ? 'blue' : 'orange'}
                dot={
                  log.points > 0 ? undefined : <ClockCircleOutlined style={{ fontSize: 16 }} />
                }
              >
                <Space>
                  <Tag color={log.team === 1 ? 'blue' : 'orange'}>Team {log.team}</Tag>
                  <Text type={log.points > 0 ? 'success' : 'danger'}>
                    {log.points > 0 ? `+${log.points}` : log.points}
                  </Text>
                  <Text type="secondary">{formatTimestamp(log.timestamp)}</Text>
                </Space>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>

        <Space style={{ marginTop: 24 }}>
          <Button onClick={undoLastLog} icon={<EditOutlined />} size="large">
            Undo Last
          </Button>
          <Button
            type="default"
            icon={<ReloadOutlined />}
            size="large"
            danger
            onClick={() => window.location.reload()}
          >
            Reset View
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            onClick={onSubmitScores}
            disabled={
              disableSubmit || (!winner || (team1Score === 0 && team2Score === 0))
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
