import React from 'react';
import { Typography, Card, Row, Col, Space, Button, Tag, Divider, Select, Input, Alert } from 'antd';
import { SaveOutlined, EditOutlined, TrophyOutlined, ReloadOutlined } from '@ant-design/icons';

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
  onResetScores: () => void; // Add this new prop
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
}) => {
  const winner = hasWinner();
  const inOvertime = team1Score >= targetScore || team2Score >= targetScore;
  
  // Calculate progress messages for each team
  const getTeamProgress = (teamScore: number, teamNum: number) => {
    if (teamScore === 0) return '';
    if (winner === teamNum) return 'WINNER!';
    if (inOvertime) return 'OVERTIME';
    return `${targetScore - teamScore} to win`;
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3}>
          Round {currentRound}
        </Title>
        
        {/* Score Targets */}
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">Target Score: {targetScore} | Overtime Limit: {overtimeLimit}</Text>
        </div>
        
        {/* Win Notification */}
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
          <Tag color="red" style={{ fontSize: '16px', padding: '5px 10px', marginBottom: 16 }}>
            Game Point - Team {gamePoint}
          </Tag>
        )}
        
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card 
              bordered 
              style={{ background: winner === 1 ? '#d4f7e6' : '#f0f8ff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text style={{ fontSize: '16px' }}>Team 1</Text>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: winner === 1 ? '#52c41a' : '#1890ff', margin: '10px 0' }}>
                    {team1Score}
                  </div>
                  <Text type={winner === 1 ? 'success' : 'secondary'} strong={winner === 1}>
                    {getTeamProgress(team1Score, 1)}
                  </Text>
                </div>
                
                <Space>
                  <Button 
                    type="primary" 
                    size="large"
                    style={{ height: '60px', width: '100px', fontSize: '24px' }}
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
              style={{ background: winner === 2 ? '#d4f7e6' : '#fffbe6', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text style={{ fontSize: '16px' }}>Team 2</Text>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: winner === 2 ? '#52c41a' : '#fa8c16', margin: '10px 0' }}>
                    {team2Score}
                  </div>
                  <Text type={winner === 2 ? 'success' : 'secondary'} strong={winner === 2}>
                    {getTeamProgress(team2Score, 2)}
                  </Text>
                </div>
                
                <Space>
                  <Button 
                    type="primary" 
                    size="large"
                    style={{ height: '60px', width: '100px', fontSize: '24px', background: winner === 2 ? '#52c41a' : '#fa8c16', borderColor: winner === 2 ? '#52c41a' : '#fa8c16' }}
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
        
        {/* Current Half and Notes fields */}
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
                    onChange={e => onSetRefereeNotes(e.target.value)}
                    placeholder="Add notes about this round..."
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        
        <Space style={{ marginBottom: 24 }}>
          <Button 
            onClick={onUndoLastScore}
            disabled={!canUndo || !!winner}
            icon={<EditOutlined />}
            size="large"
          >
            Undo Last Score
          </Button>
          
          {/* Add Reset button */}
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
            disabled={(team1Score === 0 && team2Score === 0) || !winner}
            size="large"
          >
            Submit Round Score
          </Button>
          <Button onClick={onCancel}>
            Cancel
          </Button>
        </Space>
      </div>
    </>
  );
};

export default RefereeScoringSimple;
