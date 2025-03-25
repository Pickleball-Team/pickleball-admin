import React from 'react';
import { Table, Typography, Tag, Button, Tooltip } from 'antd';
import { EditOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

// Define the shape of the match score data
interface MatchScore {
  matchScoreId: number;
  round: number;
  note: string;
  team1Score: number;
  team2Score: number;
  currentHaft?: number;
  matchId?: number;
  isFromReferee?: boolean;
  setDetails?: Array<{
    set: number;
    team1: number;
    team2: number;
    note?: string;
    currentHalf?: number;
  }>;
}

interface MatchScoreTableProps {
  matchScores: MatchScore[];
  onEditRound?: (round: number) => void;
  hideActions?: boolean;
  size?: 'default' | 'middle' | 'small';
}

const MatchScoreTable: React.FC<MatchScoreTableProps> = ({
  matchScores,
  onEditRound,
  hideActions = false,
  size = 'large'
}) => {
  const baseColumns = [
    {
      title: 'Round',
      dataIndex: 'round',
      key: 'round',
      render: (round: number, record: MatchScore) => (
        <span>
          <Tag color={record.isFromReferee ? 'purple' : 'blue'}>
            {`Round ${round}`}
          </Tag>
          {record.isFromReferee && (
            <Tooltip title="Score from Referee (in progress)">
              <InfoCircleOutlined style={{ marginLeft: 8, color: '#722ed1' }} />
            </Tooltip>
          )}
        </span>
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
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
  ];

  const actionsColumn = {
    title: 'Actions',
    key: 'actions',
    render: (_: unknown, record: MatchScore) => (
      <Button
        icon={<EditOutlined />}
        onClick={() => onEditRound && onEditRound(record.round)}
        type="link"
        disabled={record.isFromReferee} // Disable editing for temporary referee scores
      >
        Edit
      </Button>
    ),
  };

  const columns = hideActions ? baseColumns : [...baseColumns, actionsColumn];

  return (
    <Table
      dataSource={matchScores.map((score) => ({
        ...score,
        matchId: score.matchId ?? 0, // Provide a default value for matchId
        currentHaft: score.currentHaft ?? 1, // Ensure currentHaft is always a number with a default of 1
        key: score.matchScoreId // Explicitly add key for React list rendering
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
            {record.setDetails && record.setDetails.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <Text strong>Set Details:</Text>
                <Table
                  dataSource={record.setDetails.map(set => ({
                    ...set,
                    key: `${record.matchScoreId}-set-${set.set}` // Create unique keys for nested table
                  }))}
                  columns={[
                    {
                      title: 'Set',
                      dataIndex: 'set',
                      key: 'set',
                      render: (set) => <Tag color="cyan">{`Set ${set}`}</Tag>,
                    },
                    {
                      title: 'Team 1',
                      dataIndex: 'team1',
                      key: 'team1',
                      render: (score) => (
                        <Text style={{ color: '#1890ff' }}>{score}</Text>
                      ),
                    },
                    {
                      title: 'Team 2',
                      dataIndex: 'team2',
                      key: 'team2',
                      render: (score) => (
                        <Text style={{ color: '#fa8c16' }}>{score}</Text>
                      ),
                    },
                    {
                      title: 'Note',
                      dataIndex: 'note',
                      key: 'note',
                      ellipsis: true,
                    },
                  ]}
                  pagination={false}
                  size="small"
                  rowKey={record => `set-${record.set}`}
                />
              </div>
            )}
          </div>
        ),
        rowExpandable: (record) => Boolean(record.note || (record.setDetails && record.setDetails.length > 0)),
      }}
    />
  );
};

export default MatchScoreTable;
