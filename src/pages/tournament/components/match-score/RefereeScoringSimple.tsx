import React from 'react';
import { Typography, Card, Row, Col, Space, Button, Tag, Divider, Select, Input } from 'antd';
import { SaveOutlined, EditOutlined } from '@ant-design/icons';

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
  onAddPoint: (team: number, points?: number) => void;
  onSetRefereeNotes: (notes: string) => void;
  onSetRefereeCurrentHalf: (half: number) => void;
  onSubmitScores: () => void;
  onUndoLastScore: () => void;
  onCancel: () => void;
  canUndo: boolean;
}

const RefereeScoringSimple: React.FC<RefereeScoringSimpleProps> = ({
  currentRound,
  team1Score,
  team2Score,
  gamePoint,
  refereeNotes,
  refereeCurrentHalf,
  onAddPoint,
  onSetRefereeNotes,
  onSetRefereeCurrentHalf,
  onSubmitScores,
  onUndoLastScore,
  onCancel,
  canUndo,
}) => {
  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3}>
          Round {currentRound}
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
              style={{ background: '#f0f8ff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text style={{ fontSize: '16px' }}>Team 1</Text>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1890ff', margin: '10px 0' }}>
                    {team1Score}
                  </div>
                </div>
                
                <Space>
                  <Button 
                    type="primary" 
                    size="large"
                    style={{ height: '60px', width: '100px', fontSize: '24px' }}
                    onClick={() => onAddPoint(1)}
                  >
                    +1
                  </Button>
                  <Button 
                    size="large"
                    style={{ height: '60px', width: '60px' }}
                    onClick={() => onAddPoint(1, -1)}
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
              style={{ background: '#fffbe6', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text style={{ fontSize: '16px' }}>Team 2</Text>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#fa8c16', margin: '10px 0' }}>
                    {team2Score}
                  </div>
                </div>
                
                <Space>
                  <Button 
                    type="primary" 
                    size="large"
                    style={{ height: '60px', width: '100px', fontSize: '24px', background: '#fa8c16', borderColor: '#fa8c16' }}
                    onClick={() => onAddPoint(2)}
                  >
                    +1
                  </Button>
                  <Button 
                    size="large"
                    style={{ height: '60px', width: '60px' }}
                    onClick={() => onAddPoint(2, -1)}
                    disabled={team2Score <= 0}
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
            disabled={!canUndo}
            icon={<EditOutlined />}
            size="large"
          >
            Undo Last Score
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
            disabled={team1Score === 0 && team2Score === 0}
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
