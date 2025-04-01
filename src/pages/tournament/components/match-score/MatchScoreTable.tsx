import React from 'react';
import { Table, Typography, Tag, Button, Space, Popconfirm, Timeline } from 'antd';
import { EditOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';

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
  logs?: string;
  source?: 'api' | 'local';
}

// Add an interface for log entries
interface LogEntry {
  team: 1 | 2;
  points: number;
  timestamp: string;
}

interface MatchScoreTableProps {
  matchScores: MatchScore[];
  onEditRound?: (round: number) => void;
  onDeleteRound?: (round: number) => void;
  hideActions?: boolean;
  size?: 'default' | 'middle' | 'small';
  showSourceTags?: boolean;
}

const MatchScoreTable: React.FC<MatchScoreTableProps> = ({
  matchScores,
  onEditRound,
  onDeleteRound,
  hideActions = false,
  size = 'large',
  showSourceTags = false,
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

  // Helper function to parse logs
  const parseLogsFromString = (logsString?: string): LogEntry[] => {
    if (!logsString) return [];
    try {
      return JSON.parse(logsString);
    } catch (e) {
      console.error('Failed to parse logs:', e);
      return [];
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const baseColumns = [
    {
      title: 'Round',
      dataIndex: 'round',
      key: 'round',
      render: (round: number, record: MatchScore) => (
        <Space>
          <Tag color="blue">{`Round ${round}`}</Tag>
          {showSourceTags && record.source && (
            <Tag color={record.source === 'api' ? 'default' : 'green'}>
              {record.source}
            </Tag>
          )}
        </Space>
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
        {onDeleteRound && (
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
            
            {record.source && showSourceTags && (
              <p style={{ margin: '8px 0 0' }}>
                <Text strong>Source:</Text>{' '}
                <Tag color={record.source === 'api' ? 'default' : 'green'}>
                  {record.source === 'api' ? 'Server Data' : 'Local Changes'}
                </Tag>
              </p>
            )}
            
            {record.logs && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Scoring History:</Text>
                <Timeline style={{ marginTop: 12, maxHeight: '200px', overflowY: 'auto' }}>
                  {parseLogsFromString(record.logs).map((log, index) => (
                    <Timeline.Item 
                      key={index}
                      color={log.team === 1 ? 'blue' : 'orange'}
                      dot={log.points > 0 ? undefined : <ClockCircleOutlined style={{ fontSize: '16px' }} />}
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
              </div>
            )}
          </div>
        ),
        rowExpandable: (record) => Boolean(record.note || record.logs),
      }}
    />
  );
};

export default MatchScoreTable;
