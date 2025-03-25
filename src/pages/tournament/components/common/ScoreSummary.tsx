import React from 'react';
import { Row, Col, Card } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import CustomStatistic from './CustomStatistic';

interface ScoreSummaryProps {
  team1Score: number;
  team2Score: number;
}

const ScoreSummary: React.FC<ScoreSummaryProps> = ({ team1Score, team2Score }) => {
  const winner = team1Score > team2Score 
    ? 'Team 1' 
    : team2Score > team1Score 
      ? 'Team 2' 
      : 'Tie';
      
  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={8}>
        <Card bordered={false} style={{ background: '#f0f8ff' }}>
          <CustomStatistic
            title="Team 1 Total"
            value={team1Score}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false} style={{ background: '#fffbe6' }}>
          <CustomStatistic
            title="Team 2 Total"
            value={team2Score}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false} style={{ background: '#f6ffed' }}>
          <CustomStatistic
            title="Winner"
            value={winner}
            valueStyle={{ color: '#52c41a' }}
            prefix={<TrophyOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default ScoreSummary;
