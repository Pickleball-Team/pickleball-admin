import React from 'react';
import { Typography, Space, Button, Divider, Alert, Tag } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import AlertMessage from '../common/AlertMessage';
import ScoreSummary from '../common/ScoreSummary';
import MatchScoreTable from './MatchScoreTable';

const { Title, Text } = Typography;

interface EndMatchPanelProps {
  matchScores: any[];
  totalScores: { team1: number; team2: number };
  onEndMatch: () => void;
  onCancel: () => void;
  onDeleteRound?: (round: number) => void;
  localScoresCount: number;
  apiScoresCount: number;
}

const EndMatchPanel: React.FC<EndMatchPanelProps> = ({
  matchScores,
  totalScores,
  onEndMatch,
  onCancel,
  onDeleteRound,
  localScoresCount,
  apiScoresCount,
}) => {
  return (
    <>
      <AlertMessage
        message="End Match Confirmation"
        description="Ending the match will finalize the scores and update the tournament brackets. This action cannot be undone."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <div style={{ marginBottom: 16 }}>
        <Alert
          message="Submission Summary"
          description={
            <div>
              <p>
                <Text>Only locally created or modified scores will be submitted to the server.</Text>
              </p>
              <p>
                <Text>Scores breakdown:</Text>
                <ul>
                  <li>
                    <Tag color="blue">From API: {apiScoresCount}</Tag> - Already on the server
                  </li>
                  <li>
                    <Tag color="green">Local changes: {localScoresCount}</Tag> - Will be submitted
                  </li>
                </ul>
              </p>
              {localScoresCount === 0 && (
                <Text type="warning">No local scores to submit. You can close this modal.</Text>
              )}
            </div>
          }
          type="info"
          showIcon
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <Title level={4}>Score Summary</Title>
        <ScoreSummary team1Score={totalScores.team1} team2Score={totalScores.team2} />

        <MatchScoreTable 
          matchScores={matchScores} 
          hideActions={!onDeleteRound} 
          onDeleteRound={onDeleteRound} 
          size="small" 
          showSourceTags={true}
        />
        <Divider />
      </div>

      <Space>
        <Button
          type="primary"
          danger
          htmlType="submit"
          icon={<CheckCircleOutlined />}
          onClick={onEndMatch}
          disabled={localScoresCount === 0}
        >
          {localScoresCount > 0 
            ? `Submit ${localScoresCount} Local Score${localScoresCount > 1 ? 's' : ''}` 
            : 'No Local Changes To Submit'}
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Space>
    </>
  );
};

export default EndMatchPanel;
