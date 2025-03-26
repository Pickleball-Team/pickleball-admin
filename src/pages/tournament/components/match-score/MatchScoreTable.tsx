import React from 'react';
import { Table, Typography, Tag, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

// Simplified MatchScore interface
interface MatchScore {
  matchScoreId: number;
  round: number;
  note: string;
  team1Score: number;
  team2Score: number;
  currentHaft: number;
  matchId?: number;
}

interface MatchScoreTableProps {
  matchScores: MatchScore[];
  onEditRound?: (round: number) => void;
  onDeleteRound?: (round: number) => void; // Add this new prop
  hideActions?: boolean;
  size?: 'default' | 'middle' | 'small';
}

const MatchScoreTable: React.FC<MatchScoreTableProps> = ({
  matchScores,
  onEditRound,
  onDeleteRound, // Add this new prop
  hideActions = false,
  size = 'large'
}) => {
  // Helper function to get half text
  const getHalfText = (half: number) => {
    switch (half) {
      case 1: return 'First Half';
      case 2: return 'Second Half'; 
      case 3: return 'Overtime';
      default: return 'Unknown';
    }
  };

  const baseColumns = [
    {
      title: 'Round',
      dataIndex: 'round',
      key: 'round',
      render: (round: number) => (
        <Tag color="blue">{`Round ${round}`}</Tag>
      ),
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
      title: 'Half',
      dataIndex: 'currentHaft',
      key: 'currentHaft',
      render: (half: number) => (
        <Tag color={half === 1 ? 'green' : half === 2 ? 'blue' : 'purple'}>
          {getHalfText(half)}
        </Tag>
      ),
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    }
  ];

  const actionsColumn = {
    title: 'Actions',
    key: 'actions',
    render: (_: unknown, record: MatchScore) => (
      <Space>
        <Button
          icon={<EditOutlined />}
          onClick={() => onEditRound && onEditRound(record.round)}
          type="link"
        >
          Edit
        </Button>
        {onDeleteRound && ( // Only show delete if handler provided
          <Popconfirm
            title="Are you sure you want to delete this round?"
            onConfirm={() => onDeleteRound(record.round)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              type="link"
              danger
            >
              Delete
            </Button>
          </Popconfirm>
        )}
      </Space>
    ),
  };

  const columns = hideActions ? baseColumns : [...baseColumns, actionsColumn];

  return (
    <Table
      dataSource={matchScores.map((score) => ({
        ...score,
        matchId: score.matchId ?? 0,
        currentHaft: score.currentHaft ?? 1,
        key: score.matchScoreId
      }))}
      columns={columns}
      rowKey="matchScoreId"
      pagination={false}
      size={size as 'large' | 'small' | 'middle'}
      expandable={{
        expandedRowRender: (record) => (
          <div>
            <p style={{ margin: 0 }}>
              <Text strong>Full Note:</Text> {record.note}
            </p>
          </div>
        ),
        rowExpandable: (record) => Boolean(record.note),
      }}
    />
  );
};

export default MatchScoreTable;
