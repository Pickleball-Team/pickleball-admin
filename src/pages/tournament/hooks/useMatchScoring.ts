import { useState, useEffect } from 'react';
import { message } from 'antd';
import { IMatch, EndTournamentMatchDTO, MatchDetails } from '../../../modules/Macths/models';
import { useGetMatchDetails } from '../../../modules/Macths/hooks/useGetMatchDetails';

// Constants for localStorage
const MATCH_SCORES_STORAGE_KEY = 'pickleball_match_scores';
const REFEREE_SCORES_STORAGE_KEY = 'pickleball_referee_scores';
const MAX_ROUNDS_PER_MATCH = 3;

// Win score constants
export enum WinScore {
  Eleven = 1,
  Fifteen = 2,
  TwentyOne = 3,
}

export const WinScoreOptions: Map<WinScore, number> = new Map([
  [WinScore.Eleven, 11],
  [WinScore.Fifteen, 15],
  [WinScore.TwentyOne, 21],
]);

// Simplified MatchScore interface
interface MatchScore {
  matchScoreId: number;
  matchId: number;
  round: number;
  note: string;
  currentHaft: number;
  team1Score: number;
  team2Score: number;
  logs?: string;
  source?: 'api' | 'local';
}

interface ScoringHistoryEntry {
  team: number;
  points: number;
  timestamp: string;
}

// Define a log entry interface for type safety
interface LogEntry {
  team: 1 | 2;
  points: number;
  timestamp: string;
}

export const useMatchScoring = (match: IMatch | null) => {
  // Core state
  const [matchScores, setMatchScores] = useState<MatchScore[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(1);
  
  // Current score being edited
  const [team1Score, setTeam1Score] = useState<number>(0);
  const [team2Score, setTeam2Score] = useState<number>(0);
  
  // UI state for referee scoring
  const [scoringHistory, setScoringHistory] = useState<ScoringHistoryEntry[]>([]);
  const [refereeNotes, setRefereeNotes] = useState<string>('');
  const [refereeCurrentHalf, setRefereeCurrentHalf] = useState<number>(1);
  
  // Track data source for showing appropriate UI feedback
  const [dataSource, setDataSource] = useState<'api' | 'localStorage' | 'new'>('new');
  
  // Fetch match details from the API
  const { 
    data: matchDetails, 
    isLoading: isLoadingMatchDetails,
    isError: isMatchDetailsError
  } = useGetMatchDetails(match?.id || 0);

  // Get target score based on match winScore
  const getTargetScore = (): number => {
    if (!match?.winScore) return 11; // Default to 11 if not specified
    
    const winScoreValue = WinScoreOptions.get(match.winScore as WinScore);
    return winScoreValue || 11; // Default to 11 if not found in the map
  };

  // Get overtime limit
  const getOvertimeLimit = (): number => {
    return getTargetScore() + 5;
  };

  // Load match data - combining API and localStorage
  useEffect(() => {
    if (!match?.id) return;

    let apiScores: MatchScore[] = [];
    let localScores: MatchScore[] = [];
    
    // First check if we have match details from the API
    if (matchDetails && matchDetails.matchScoreDetails?.length > 0) {
      // Convert API match score format to our local format
      apiScores = matchDetails.matchScoreDetails.map(detail => ({
        matchScoreId: detail.matchScoreId,
        matchId: match.id,
        round: detail.round,
        note: detail.note,
        currentHaft: detail.currentHaft,
        team1Score: detail.team1Score,
        team2Score: detail.team2Score,
        logs: detail.logs,
        source: 'api' as const
      }));
      
      console.log('Loaded match scores from API:', apiScores.length);
    }

    // Check for local storage data regardless of API data
    const savedScores = localStorage.getItem(`${MATCH_SCORES_STORAGE_KEY}_${match.id}`);
    if (savedScores) {
      try {
        const parsedScores = JSON.parse(savedScores);
        // Mark these scores as coming from localStorage
        localScores = parsedScores.map((score: MatchScore) => ({
          ...score,
          source: 'local' as const
        }));
        console.log('Found local scores:', localScores.length);
      } catch (e) {
        console.error('Failed to parse saved match scores', e);
      }
    }
    
    // Merge scores from both sources, giving priority to API scores
    const mergedScores = mergeScores(apiScores, localScores);
    
    // Check if we have any scores after merging
    if (mergedScores.length > 0) {
      setMatchScores(mergedScores);
      setDataSource(apiScores.length > 0 ? 'api' : 'localStorage');
      
      // Set the current round to the next available round number
      const maxRound = Math.max(...mergedScores.map(score => score.round));
      setCurrentRound(maxRound + 1);
    } else {
      // Do not automatically create an empty first round
      // Only set empty array if no scores are available
      setMatchScores([]);
      setDataSource('new');
      setCurrentRound(1);
      console.log('No match scores found - starting with empty state');
    }
    
    // Always load referee scoring data for the current session
    loadRefereeData();
    
  }, [match?.id, matchDetails]);
  
  // Merge API scores and local scores, respecting the round limit
  const mergeScores = (apiScores: MatchScore[], localScores: MatchScore[]): MatchScore[] => {
    // Create a map of rounds that exist in API data
    const apiRounds = new Set(apiScores.map(score => score.round));
    
    // Filter local scores to only include rounds that don't exist in API data
    const uniqueLocalScores = localScores.filter(score => !apiRounds.has(score.round));
    
    // Combine API scores and unique local scores
    let combinedScores = [...apiScores, ...uniqueLocalScores];
    
    // Sort by round number
    combinedScores.sort((a, b) => a.round - b.round);
    
    // Enforce maximum round limit
    if (combinedScores.length > MAX_ROUNDS_PER_MATCH) {
      console.log(`Limiting scores to ${MAX_ROUNDS_PER_MATCH} rounds`);
      combinedScores = combinedScores.slice(0, MAX_ROUNDS_PER_MATCH);
    }
    
    return combinedScores;
  };
  
  // Load referee data from localStorage
  const loadRefereeData = () => {
    if (!match?.id) return;
    
    const savedRefereeData = localStorage.getItem(`${REFEREE_SCORES_STORAGE_KEY}_${match.id}`);
    if (savedRefereeData) {
      try {
        const parsedData = JSON.parse(savedRefereeData);
        setCurrentRound(parsedData.currentRound || 1);
        setTeam1Score(parsedData.team1Score || 0);
        setTeam2Score(parsedData.team2Score || 0);
        setScoringHistory(parsedData.scoringHistory || []);
        setRefereeNotes(parsedData.refereeNotes || '');
        setRefereeCurrentHalf(parsedData.refereeCurrentHalf || 1);
      } catch (e) {
        console.error('Failed to parse saved referee data', e);
      }
    }
  };
  
  // Save match scores to localStorage - only save non-API scores
  useEffect(() => {
    if (match?.id && matchScores.length > 0) {
      // Only store rounds that don't exist in API data
      const localScoresToStore = matchScores
        .filter(score => score.source !== 'api')
        .map(({ source, ...rest }) => rest); // Remove the source property before storing
      
      if (localScoresToStore.length > 0) {
        localStorage.setItem(`${MATCH_SCORES_STORAGE_KEY}_${match.id}`, JSON.stringify(localScoresToStore));
        console.log(`Saved ${localScoresToStore.length} local scores to localStorage`);
      }
    }
  }, [match?.id, matchScores]);
  
  // Save referee data to localStorage
  useEffect(() => {
    if (match?.id) {
      const refereeData = {
        currentRound,
        team1Score,
        team2Score,
        scoringHistory,
        refereeNotes,
        refereeCurrentHalf
      };
      localStorage.setItem(`${REFEREE_SCORES_STORAGE_KEY}_${match.id}`, JSON.stringify(refereeData));
    }
  }, [
    match?.id, currentRound, team1Score, team2Score, 
    scoringHistory, refereeNotes, refereeCurrentHalf
  ]);

  // Calculate total scores
  const totalScores = matchScores.reduce(
    (acc, score) => ({
      team1: acc.team1 + score.team1Score,
      team2: acc.team2 + score.team2Score,
    }),
    { team1: 0, team2: 0 }
  );

  // Determine the winner based on the total score
  const getWinner = () => {
    if (totalScores.team1 > totalScores.team2) return 'Team 1';
    if (totalScores.team2 > totalScores.team1) return 'Team 2';
    return 'Tie';
  };

  // Check if a team has won the current round
  const hasWinner = (): number | null => {
    const targetScore = getTargetScore();
    const overtimeLimit = getOvertimeLimit();
    
    // Check if either team has reached the target score with a 2-point lead
    if (team1Score >= targetScore && team1Score >= team2Score + 2) {
      return 1; // Team 1 wins
    }
    
    if (team2Score >= targetScore && team2Score >= team1Score + 2) {
      return 2; // Team 2 wins
    }
    
    // Check if either team has reached the overtime limit
    if (team1Score >= overtimeLimit) return 1;
    if (team2Score >= overtimeLimit) return 2;
    
    // No winner yet
    return null;
  };

  // Add a new round score - with round limit check
  const handleAddRound = (values: {
    note: string;
    currentHaft: number;
    team1Score: number;
    team2Score: number;
    logs?: string;
  }): MatchScore | null => {
    // Check if we've reached the maximum number of rounds
    if (matchScores.length >= MAX_ROUNDS_PER_MATCH) {
      message.error(`Maximum of ${MAX_ROUNDS_PER_MATCH} rounds allowed per match.`);
      return null;
    }
    
    const newScore: MatchScore = {
      matchScoreId: Math.floor(Math.random() * 1000) + 100,
      matchId: match?.id || 0,
      round: matchScores.length + 1,
      note: values.note,
      currentHaft: values.currentHaft,
      team1Score: values.team1Score,
      team2Score: values.team2Score,
      logs: values.logs || JSON.stringify([{
        team: values.team1Score > values.team2Score ? 1 : 2,
        points: Math.max(values.team1Score, values.team2Score),
        timestamp: new Date().toISOString()
      }]),
      source: 'local'
    };

    setMatchScores(prev => [...prev, newScore]);
    message.success('New round score added');
    return newScore;
  };

  // Edit an existing round score
  const handleEditRound = (
    values: {
      note: string;
      currentHaft: number;
      team1Score: number;
      team2Score: number;
      logs?: string;
    }, 
    editingRound: number
  ): MatchScore[] => {
    const updatedScores = matchScores.map((score) =>
      score.round === editingRound
        ? {
            ...score,
            note: values.note,
            currentHaft: values.currentHaft,
            team1Score: values.team1Score,
            team2Score: values.team2Score,
            // Preserve existing logs or use new ones if provided
            logs: values.logs || score.logs
          }
        : score
    );

    setMatchScores(updatedScores);
    message.success('Round score updated');
    return updatedScores;
  };

  // Helper function to add points to a team
  const addPointToTeam = (team: number, points: number = 1): void => {
    if (team === 1) {
      setTeam1Score(prev => prev + points);
    } else {
      setTeam2Score(prev => prev + points);
    }
    
    // Create a log entry
    const logEntry: LogEntry = {
      team: team as 1 | 2,
      points,
      timestamp: new Date().toISOString()
    };
    
    // Add to scoring history for current session
    setScoringHistory(prev => [
      ...prev,
      {
        team,
        points,
        timestamp: logEntry.timestamp
      }
    ]);
  };
  
  // Submit referee scores with round limit check
  const submitRefereeScores = (): MatchScore | null => {
    try {
      // Check if we've reached the maximum number of rounds
      if (matchScores.length >= MAX_ROUNDS_PER_MATCH) {
        message.error(`Maximum of ${MAX_ROUNDS_PER_MATCH} rounds allowed per match.`);
        return null;
      }
      
      if (team1Score === 0 && team2Score === 0) {
        message.warning('Cannot save a round with no points');
        return null;
      }
      
      const winner = hasWinner();
      if (winner === null) {
        message.warning('Cannot submit round until a team has won');
        return null;
      }
      
      // Convert scoring history to logs string
      const logsData = JSON.stringify(scoringHistory);
      
      // Create new score entry directly from referee scoring
      const newScore: MatchScore = {
        matchScoreId: Math.floor(Math.random() * 1000) + 100,
        matchId: match?.id || 0,
        round: matchScores.length + 1,
        note: refereeNotes || `Round ${currentRound}: Team ${winner} wins with score ${team1Score}-${team2Score}`,
        currentHaft: refereeCurrentHalf,
        team1Score: team1Score,
        team2Score: team2Score,
        logs: logsData, // Add the logs
        source: 'local'
      };
      
      // Add to match scores
      setMatchScores(prev => [...prev, newScore]);
      
      // Reset the referee scoring state
      setTeam1Score(0);
      setTeam2Score(0);
      setRefereeNotes('');
      setCurrentRound(prev => prev + 1);
      setScoringHistory([]);
      
      message.success(`Round ${currentRound} completed! Team ${winner} wins.`);
      return newScore;
    } catch (error) {
      console.error('Error submitting round scores:', error);
      message.error('Failed to submit round scores');
      return null;
    }
  };

  // Undo last scoring action
  const undoLastScore = (): void => {
    if (scoringHistory.length === 0) return;
    
    const lastAction = scoringHistory[scoringHistory.length - 1];
    if (lastAction.team === 1) {
      setTeam1Score(prev => prev - lastAction.points);
    } else {
      setTeam2Score(prev => prev - lastAction.points);
    }
    
    setScoringHistory(prev => prev.slice(0, -1));
  };

  // Clean up localStorage - improved to be more selective
  const cleanupStorageForMatch = (): void => {
    if (match?.id) {
      // Only remove local storage entries for this match if we have API data
      // or if the match is being completely ended
      if (matchScores.some(score => score.source === 'api')) {
        // We have API data, so we can safely remove local data
        console.log(`Cleaning up localStorage for match ${match.id}`);
        localStorage.removeItem(`${MATCH_SCORES_STORAGE_KEY}_${match.id}`);
        localStorage.removeItem(`${REFEREE_SCORES_STORAGE_KEY}_${match.id}`);
      } else {
        // Keep the data in case the API call failed and we need it later
        console.log(`Keeping localStorage data for match ${match.id} (no API data available)`);
      }
    }
  };

  // Custom method to selectively clean up only submitted rounds
  const cleanupSubmittedRounds = (): void => {
    if (match?.id) {
      // Get existing local scores
      const savedScores = localStorage.getItem(`${MATCH_SCORES_STORAGE_KEY}_${match.id}`);
      if (savedScores) {
        try {
          // Only keep scores that haven't been submitted yet
          const parsedScores = JSON.parse(savedScores);
          
          // Filter to rounds not in our current matchScores (which were just submitted)
          // This is useful if we're not submitting all scores at once
          const roundsToKeep = parsedScores.filter((score: any) => {
            return !matchScores.some(ms => ms.round === score.round && ms.source === 'local');
          });
          
          if (roundsToKeep.length > 0) {
            // Save the remaining scores
            localStorage.setItem(
              `${MATCH_SCORES_STORAGE_KEY}_${match.id}`, 
              JSON.stringify(roundsToKeep)
            );
            console.log(`Keeping ${roundsToKeep.length} unsubmitted rounds in localStorage`);
          } else {
            // No scores to keep, remove the entry
            localStorage.removeItem(`${MATCH_SCORES_STORAGE_KEY}_${match.id}`);
            console.log(`Removed all local scores for match ${match.id}`);
          }
        } catch (e) {
          console.error('Failed to parse saved match scores during cleanup', e);
          // In case of error, leave the data intact
        }
      }
    }
  };

  // Calculate if a team has game point
  const gamePoint = (() => {
    const targetScore = getTargetScore();
    
    // Team 1 game point conditions
    if (team1Score >= targetScore - 1 && team1Score >= team2Score + 1) {
      return 1;
    }
    
    // Team 2 game point conditions
    if (team2Score >= targetScore - 1 && team2Score >= team1Score + 1) {
      return 2;
    }
    
    return null;
  })();

  // Reset current scores in referee scoring
  const resetCurrentScores = (): void => {
    setTeam1Score(0);
    setTeam2Score(0);
    setScoringHistory([]);
    message.info('Scores reset to zero');
  };

  // Delete a round score - handle different data sources
  const deleteRoundScore = (round: number): void => {
    // If data was from API, warn user about local changes
    if (dataSource === 'api') {
      message.warning('You are modifying data that exists on the server. Changes will only be saved locally until you submit the match.');
      setDataSource('localStorage');
    }
    
    // Filter out the specific round
    const newScores = matchScores.filter(score => score.round !== round);
    
    // Re-number the rounds to ensure consistent sequence
    const renumberedScores = newScores.map((score, index) => ({
      ...score,
      round: index + 1
    }));
    
    setMatchScores(renumberedScores);
    message.success(`Round ${round} deleted`);
  };

  // Helper function to parse logs from a match score
  const getLogsFromMatchScore = (matchScore: MatchScore): LogEntry[] => {
    if (!matchScore.logs) return [];
    try {
      return JSON.parse(matchScore.logs);
    } catch (e) {
      console.error('Failed to parse logs:', e);
      return [];
    }
  };

  // Check if we can add more rounds
  const canAddMoreRounds = (): boolean => {
    return matchScores.length < MAX_ROUNDS_PER_MATCH;
  };

  // Return additional information about data source and loading state
  return {
    // State
    matchScores,
    currentRound,
    team1Score,
    team2Score,
    gamePoint,
    scoringHistory,
    refereeNotes,
    refereeCurrentHalf,
    totalScores,
    targetScore: getTargetScore(),
    overtimeLimit: getOvertimeLimit(),
    maxRounds: MAX_ROUNDS_PER_MATCH,
    
    // Status checks
    hasWinner,
    isLoadingMatchDetails,
    isMatchDetailsError,
    dataSource,
    matchDetails,
    canAddMoreRounds,
    
    // Actions
    setMatchScores,
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
    getLogsFromMatchScore
  };
};
