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
  Alert,
  Spin,
} from 'antd';
import {
  TrophyOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  DeleteOutlined,
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
    targetScore,
    overtimeLimit,
    hasWinner,
    setRefereeNotes,
    setRefereeCurrentHalf,
    handleAddRound,
    handleEditRound,
    addPointToTeam,
    submitRefereeScores,
    undoLastScore,
    cleanupStorageForMatch,
    cleanupSubmittedRounds,
    getWinner,
    resetCurrentScores,
    deleteRoundScore,
    isLoadingMatchDetails,
    isMatchDetailsError,
    dataSource,
    matchDetails,
    canAddMoreRounds,
    maxRounds,
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

  const handleEndMatch = async () => {
    try {
      const loadingMessage = message.loading('Submitting match scores...', 0);
  
      const localScores = matchScores.filter(score => score.source === 'local');
      
      if (localScores.length === 0) {
        message.info('No local score changes to submit.');
        loadingMessage();
        onClose();
        refetch();
        return;
      }
  
      const failedRequests: any[] = [];
      const successfulRequests: any[] = [];
  
      for (const score of localScores) {
        const scoreData: EndTournamentMatchDTO = {
          matchId: match.id,
          round: score.round,
          note: score.note,
          currentHaft: score.currentHaft,
          team1Score: score.team1Score,
          team2Score: score.team2Score,
          logs: JSON.stringify(score.logs),
        };
  
        try {
          console.log(`Submitting local score for round ${score.round}`);
          const result = await endMatch(scoreData);
          successfulRequests.push(result);
        } catch (err) {
          console.error(`Failed to submit score for round ${score.round}`, err);
          failedRequests.push({ scoreData, error: err });
        }
      }
  
      if (failedRequests.length > 0) {
        message.warning(
          `${failedRequests.length} API calls failed. Check the console for details.`
        );
      }
  
      if (successfulRequests.length === 0 && failedRequests.length > 0) {
        throw new Error('All API calls failed.');
      }
  
      loadingMessage();
      cleanupSubmittedRounds();
  
      if (successfulRequests.length > 0) {
        message.success(`Match ended successfully. Submitted ${successfulRequests.length} rounds.`);
      } else {
        message.info('No changes were submitted.');
      }
  
      onClose();
      refetch();
    } catch (error: any) {
      message.error(`Failed to end match: ${error.message}`);
    }
  };
  

  // Add a new summary section on the End Match tab
  const localScoresCount = matchScores.filter(score => score.source === 'local').length;
  const apiScoresCount = matchScores.filter(score => score.source === 'api').length;

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
      width={1100}
      footer={null}
    >
      {isLoadingMatchDetails && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading match details from server...</div>
        </div>
      )}

      {isMatchDetailsError && (
        <Alert
          message="Error Loading Match Data"
          description="Could not load match data from the server. Using locally stored data instead."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {dataSource === 'api' && (
        <Alert
          message="Loaded from Server"
          description="Match data was loaded from the server. Any changes will be stored locally until you submit them."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          banner
        />
      )}

      {dataSource === 'localStorage' && !isMatchDetailsError && (
        <Alert
          message="Loaded from Local Storage"
          description="You are viewing locally saved data that has not been submitted to the server."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          banner
        />
      )}

      {!canAddMoreRounds() && (
        <Alert
          message={`Maximum Rounds Reached (${maxRounds})`}
          description={`This match can have a maximum of ${maxRounds} rounds. Please delete an existing round if you need to add a new one.`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

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
          <ScoreSummary
            team1Score={totalScores.team1}
            team2Score={totalScores.team2}
          />

          {matchScores.length === 0 ? (
            <Alert
              message="No Rounds Available"
              description={
                isLoadingMatchDetails
                  ? "Loading match data..."
                  : "This match doesn't have any scored rounds yet. Use the 'Add Round Score' button or 'Referee Scoring' tab to add scores."
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : (
            <MatchScoreTable
              matchScores={matchScores}
              onEditRound={startEditRound}
              onDeleteRound={deleteRoundScore}
            />
          )}

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
              disabled={!canAddMoreRounds()}
              title={!canAddMoreRounds() ? `Maximum of ${maxRounds} rounds reached` : undefined}
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
            onDeleteRound={deleteRoundScore}
            localScoresCount={localScoresCount}
            apiScoresCount={apiScoresCount}
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
          {!canAddMoreRounds() ? (
            <Alert
              message={`Maximum Rounds Reached (${maxRounds})`}
              description={`This match already has the maximum of ${maxRounds} rounds. Please delete an existing round if you need to add a new one.`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : (
            <RefereeScoringSimple
              currentRound={currentRound}
              team1Score={team1Score}
              team2Score={team2Score}
              gamePoint={gamePoint}
              refereeNotes={refereeNotes}
              refereeCurrentHalf={refereeCurrentHalf}
              targetScore={targetScore}
              overtimeLimit={overtimeLimit}
              hasWinner={hasWinner}
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
              onResetScores={resetCurrentScores}
              scoringHistory={scoringHistory}
              disableSubmit={!canAddMoreRounds()}
            />
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default MatchScoreModal;
