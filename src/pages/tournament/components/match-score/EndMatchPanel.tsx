import React from 'react';
import { Typography, Space, Button, Divider } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import AlertMessage from '../common/AlertMessage';
import ScoreSummary from '../common/ScoreSummary';
import MatchScoreTable from './MatchScoreTable';

const { Title } = Typography;

interface EndMatchPanelProps {
  matchScores: any[];
  totalScores: { team1: number; team2: number };
  onEndMatch: () => void;
  onCancel: () => void;
}

const EndMatchPanel: React.FC<EndMatchPanelProps> = ({
  matchScores,
  totalScores,
  onEndMatch,
  onCancel,
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

      <div style={{ marginBottom: 24 }}>
        <Title level={4}>Score Summary</Title>
        <ScoreSummary team1Score={totalScores.team1} team2Score={totalScores.team2} />

        <MatchScoreTable matchScores={matchScores} hideActions size="small" />
        <Divider />
      </div>

      <Space>
        <Button
          type="primary"
          danger
          htmlType="submit"
          icon={<CheckCircleOutlined />}
          onClick={onEndMatch}
        >
          Confirm End Match
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Space>
    </>
  );
};

export default EndMatchPanel;
