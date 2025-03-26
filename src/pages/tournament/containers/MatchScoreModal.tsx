import React, { useState } from 'react';
import {
  Modal,
  Typography,
  Button,
  Form,
  Space,
  Tabs,
  Divider,
  message,
} from 'antd';
import {
  TrophyOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { IMatch, EndTournamentMatchDTO } from '../../../modules/Macths/models';
import { useEndTournamentMatch } from '../../../modules/Macths/hooks/useEndTournamentMatch';
import { useMatchScoring } from '../hooks/useMatchScoring';

// Import components
import ScoreSummary from '../components/common/ScoreSummary';
import MatchScoreTable from '../components/match-score/MatchScoreTable';
import ScoreEntryForm from '../components/match-score/ScoreEntryForm';
import EndMatchPanel from '../components/match-score/EndMatchPanel';
import RefereeScoringSimple from '../components/match-score/RefereeScoringSimple';

const { TabPane } = Tabs;

interface MatchScoreModalProps {
  visible: boolean;
  onClose: () => void;
  match: IMatch;
  refetch: () => void;
}

const MatchScoreModal: React.FC<MatchScoreModalProps> = ({
  visible,
  onClose,
  match,
  refetch,
}) => {
  const [activeTab, setActiveTab] = useState('viewScores');
  const [editingRound, setEditingRound] = useState<number | null>(null);
  const [form] = Form.useForm();
  const { mutateAsync: endMatch } = useEndTournamentMatch();

  // Use our simplified hook for match scoring logic
  const {
    matchScores,
    currentRound,
    team1Score,
    team2Score,
    gamePoint,
    scoringHistory,
    refereeNotes,
    refereeCurrentHalf,
    totalScores,
    setRefereeNotes,
    setRefereeCurrentHalf,
    handleAddRound,
    handleEditRound,
    addPointToTeam,
    submitRefereeScores,
    undoLastScore,
    cleanupStorageForMatch,
    getWinner
  } = useMatchScoring(match);

  // Start editing a round
  const startEditRound = (round: number) => {
    const scoreToEdit = matchScores.find((score) => score.round === round);
    if (scoreToEdit) {
      form.setFieldsValue({
        round: scoreToEdit.round,
        note: scoreToEdit.note,
        currentHaft: scoreToEdit.currentHaft,
        team1Score: scoreToEdit.team1Score,
        team2Score: scoreToEdit.team2Score,
      });
      setEditingRound(round);
      setActiveTab('addScore');
    }
  };

  // Handle form submission for adding/editing scores
  const onFormFinish = (values: any) => {
    if (editingRound) {
      handleEditRound(values, editingRound);
      setEditingRound(null);
    } else {
      handleAddRound(values);
    }
    form.resetFields();
    setActiveTab('viewScores');
  };

  // Handle ending the match - using EndTournamentMatchDTO
  const handleEndMatch = async () => {
    try {
      // Show loading message
      const loadingMessage = message.loading('Submitting match scores...', 0);

      // Create an array of promises for each round score
      const scorePromises = matchScores.map((score) => {
        const scoreData: EndTournamentMatchDTO = {
          matchId: match.id,
          round: score.round,
          note: score.note,
          currentHaft: score.currentHaft,
          team1Score: score.team1Score,
          team2Score: score.team2Score,
        };

        return endMatch(scoreData);
      });

      // Add final summary data with winner information
      const finalData: EndTournamentMatchDTO = {
        matchId: match.id,
        round: matchScores.length + 1,
        note: `Match ended with ${totalScores.team1}-${totalScores.team2}. Winner: ${getWinner()}`,
        currentHaft: 1, // Default to first half for final result
        team1Score: totalScores.team1,
        team2Score: totalScores.team2,
      };

      scorePromises.push(endMatch(finalData));

      // Execute all promises in parallel
      await Promise.all(scorePromises);

      // Close loading message
      loadingMessage();

      // Clean up localStorage
      cleanupStorageForMatch();

      // Show success message
      message.success('Match ended successfully');

      // Close modal and refresh data
      onClose();
      refetch();
    } catch (error: any) {
      message.error(`Failed to end match: ${error.message}`);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrophyOutlined style={{ color: '#faad14', fontSize: '20px' }} />
          <span>Match Scores - {match?.title}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* View Scores Tab */}
        <TabPane
          tab={
            <span>
              <TeamOutlined /> View Scores
            </span>
          }
          key="viewScores"
        >
          <ScoreSummary team1Score={totalScores.team1} team2Score={totalScores.team2} />

          <MatchScoreTable
            matchScores={matchScores}
            onEditRound={startEditRound}
          />

          <Divider />

          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setEditingRound(null);
                form.setFieldsValue({
                  currentHaft: 1,
                  team1Score: 0,
                  team2Score: 0,
                  note: '',
                });
                setActiveTab('addScore');
              }}
            >
              Add Round Score
            </Button>
            <Button
              type="primary"
              danger
              icon={<CheckCircleOutlined />}
              onClick={() => setActiveTab('endMatch')}
            >
              End Match
            </Button>
          </Space>
        </TabPane>

        {/* Add/Edit Score Tab */}
        <TabPane
          tab={
            <span>
              <PlusOutlined /> {editingRound ? 'Edit' : 'Add'} Score
            </span>
          }
          key="addScore"
        >
          <ScoreEntryForm
            form={form}
            isEditing={!!editingRound}
            onFinish={onFormFinish}
            onCancel={() => setActiveTab('viewScores')}
            initialValues={{
              round: matchScores.length + 1,
              currentHaft: 1,
              team1Score: 0,
              team2Score: 0,
              note: '',
            }}
          />
        </TabPane>

        {/* End Match Tab */}
        <TabPane
          tab={
            <span>
              <CheckCircleOutlined /> End Match
            </span>
          }
          key="endMatch"
        >
          <EndMatchPanel
            matchScores={matchScores}
            totalScores={totalScores}
            onEndMatch={handleEndMatch}
            onCancel={() => setActiveTab('viewScores')}
          />
        </TabPane>

        {/* Referee Scoring Tab */}
        <TabPane
          tab={
            <span>
              <TeamOutlined /> Referee Scoring
            </span>
          }
          key="refereeScoring"
        >
          <RefereeScoringSimple
            currentRound={currentRound}
            team1Score={team1Score}
            team2Score={team2Score}
            gamePoint={gamePoint}
            refereeNotes={refereeNotes}
            refereeCurrentHalf={refereeCurrentHalf}
            onAddPoint={addPointToTeam}
            onSetRefereeNotes={setRefereeNotes}
            onSetRefereeCurrentHalf={setRefereeCurrentHalf}
            onSubmitScores={() => {
              submitRefereeScores();
              setActiveTab('viewScores');
            }}
            onUndoLastScore={undoLastScore}
            onCancel={() => setActiveTab('viewScores')}
            canUndo={scoringHistory.length > 0}
          />
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default MatchScoreModal;
