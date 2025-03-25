import React from 'react';
import { Typography, Card, Row, Col, Space, Button, Tag, Divider, Table, Select, Input } from 'antd';
import { SaveOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface RefereeScoreProps {
  currentRound: number;
  currentSet: number;
  team1Score: number;
  team2Score: number;
  gamePoint: number | null;
  setsWon: { team1: number; team2: number };
  setScores: Array<{ set: number; team1: number; team2: number; note?: string; currentHalf?: number }>;
  refereeNotes: string;
  refereeCurrentHalf: number;
  onAddPoint: (team: number, points?: number) => void;
  onSetRefereeNotes: (notes: string) => void;
  onSetRefereeCurrentHalf: (half: number) => void;
  onFinalizeSet: () => void;
  onUndoLastScore: () => void;
  onSubmitRoundScores: () => void;
  onCancel: () => void;
  canUndo: boolean;
}

const RefereeScoring: React.FC<RefereeScoreProps> = ({
  currentRound,
  currentSet,
  team1Score,
  team2Score,
  gamePoint,
  setsWon,
  setScores,
  refereeNotes,
  refereeCurrentHalf,
  onAddPoint,
  onSetRefereeNotes,
  onSetRefereeCurrentHalf,
  onFinalizeSet,
  onUndoLastScore,
  onSubmitRoundScores,
  onCancel,
  canUndo,
}) => {
  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3}>
          Round {currentSet}
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
                  <Text>Sets won: {setsWon.team1}</Text>
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
                  <Text>Sets won: {setsWon.team2}</Text>
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
                placeholder="Add notes about this set..."
              />
            </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        
        <Space style={{ marginBottom: 24 }}>
          <Button 
            type="default" 
            icon={<SaveOutlined />} 
            onClick={onFinalizeSet}
            disabled={team1Score === 0 && team2Score === 0}
            size="large"
          >
            End Set & Save
          </Button>
          
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
                title: 'Half',
                dataIndex: 'currentHalf',
                key: 'currentHalf',
                render: (half) => {
                  const halfText = half === 1 ? 'First Half' : half === 2 ? 'Second Half' : 'Overtime';
                  return <Text>{halfText}</Text>;
                }
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
            expandable={{
              expandedRowRender: (record) => (
                <p style={{ margin: 0 }}>
                  <Text strong>Notes:</Text> {record.note || 'No notes'}
                </p>
              ),
            }}
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
                <Table.Summary.Cell index={3}></Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
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
            onClick={onSubmitRoundScores}
            disabled={setScores.length === 0 && team1Score === 0 && team2Score === 0}
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

export default RefereeScoring;
