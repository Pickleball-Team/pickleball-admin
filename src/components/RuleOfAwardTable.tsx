import React from 'react';
import { Table, Card, Typography, Tag, Spin, Empty, Tooltip } from 'antd';
import { TrophyOutlined, PercentageOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useGetRuleOfAward } from '../modules/Tournaments/hooks/useGetRuleOfAward';
import { RuleOfAward } from '../modules/Tournaments/models/index';


const { Text } = Typography;

const RuleOfAwardTable: React.FC = () => {
  const { data: ruleOfAward, isLoading, error } = useGetRuleOfAward();

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}`;
    }
  };

  const getTagColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'gold';
      case 2:
        return 'silver';
      case 3:
        return '#cd7f32'; // bronze
      default:
        return 'blue';
    }
  };

const columns = [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
    },
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (name: string, record: RuleOfAward) => (
            <Tag 
                color={getTagColor(record.id)}
                style={{ 
                    fontSize: '16px', 
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontWeight: 'bold'
                }}
            >
                {getMedalIcon(record.position)} 
            </Tag>
        ),
    },
    {
        title: 'percentOfPrize',
        dataIndex: 'percentOfPrize',
        key: 'percentOfPrize',
        render: (percentOfPrize: string, record: RuleOfAward) => (
         <h2>{percentOfPrize} %</h2>
      ),
     
    },
];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <Spin size="large" />
        <Text style={{ display: 'block', marginTop: '16px' }}>Loading prize distribution rules...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Failed to load prize distribution rules"
      />
    );
  }

  if (!ruleOfAward || ruleOfAward.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No prize distribution rules available"
      />
    );
  }
console.log(ruleOfAward);

  return (
    <Card 
      title={
        <div>
          <TrophyOutlined style={{ color: '#faad14', marginRight: '8px' }} />
          <Text strong style={{ fontSize: '16px' }}>Prize Distribution Rules</Text>
          <Tooltip title="These rules define how prize money is distributed among winners">
            <InfoCircleOutlined style={{ marginLeft: '8px', color: '#1890ff' }} />
          </Tooltip>
        </div>
      }
      bordered={false}
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
    >
      <Table 
        columns={columns} 
        dataSource={ruleOfAward || []} 
        rowKey="id" 
        pagination={false}
        style={{ marginTop: '16px' }}
       
      />
    </Card>
  );
};

export default RuleOfAwardTable;