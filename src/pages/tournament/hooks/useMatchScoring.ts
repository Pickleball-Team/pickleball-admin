import { useState, useEffect } from 'react';
import { message } from 'antd';
import { IMatch, EndTournamentMatchDTO } from '../../../modules/Macths/models';

// Constants for localStorage
const MATCH_SCORES_STORAGE_KEY = 'pickleball_match_scores';
const REFEREE_SCORES_STORAGE_KEY = 'pickleball_referee_scores';

// Simplified MatchScore interface - removed setDetails and isFromReferee
interface MatchScore {
  matchScoreId: number;
  matchId: number;
  round: number;
  note: string;
  currentHaft: number;
  team1Score: number;
  team2Score: number;
}

interface ScoringHistoryEntry {
  team: number;
  points: number;
  timestamp: string;
}

interface TeamScores {
  team1: number;
  team2: number;
}

// Sample data for match scores
const SAMPLE_MATCH_SCORES: MatchScore[] = [
  {
    matchScoreId: 1,
    matchId: 3,
    round: 1,
    note: 'First round, Team 1 started strong',
    currentHaft: 1,
    team1Score: 11,
    team2Score: 7,
  },
];

// Utility function to normalize half values
const normalizeHalf = (value: any): number => {
  if (typeof value === 'number') return value;
  if (value === undefined || value === null) return 1;
  const numeric = Number(value);
  return isNaN(numeric) ? 1 : numeric;
};

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

  // Load match data from localStorage
  useEffect(() => {
    if (match?.id) {
      // Load match scores
      const savedScores = localStorage.getItem(`${MATCH_SCORES_STORAGE_KEY}_${match.id}`);
      if (savedScores) {
        try {
          const parsedScores = JSON.parse(savedScores);
          setMatchScores(parsedScores);
        } catch (e) {
          console.error('Failed to parse saved match scores', e);
        }
      } else if (match?.id === 3) {
        setMatchScores(SAMPLE_MATCH_SCORES);
      } else {
        // For other match IDs, create empty sample data
        setMatchScores([
          {
            matchScoreId: 100 + match?.id,
            matchId: match?.id,
            round: 1,
            note: 'First round',
            currentHaft: 1,
            team1Score: 0,
            team2Score: 0,
          },
        ]);
      }
      
      // Load referee scoring data
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
    }
  }, [match?.id]);
  
  // Save match scores to localStorage
  useEffect(() => {
    if (match?.id && matchScores.length > 0) {
      localStorage.setItem(`${MATCH_SCORES_STORAGE_KEY}_${match.id}`, JSON.stringify(matchScores));
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

  // Add a new round score
  const handleAddRound = (values: {
    note: string;
    currentHaft: number;
    team1Score: number;
    team2Score: number;
  }): MatchScore => {
    const newScore: MatchScore = {
      matchScoreId: Math.floor(Math.random() * 1000) + 100,
      matchId: match?.id || 0,
      round: matchScores.length + 1,
      note: values.note,
      currentHaft: values.currentHaft,
      team1Score: values.team1Score,
      team2Score: values.team2Score,
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
    
    // Add to scoring history
    setScoringHistory(prev => [
      ...prev,
      {
        team,
        points,
        timestamp: new Date().toISOString()
      }
    ]);
  };
  
  // Submit referee scores as a new round
  const submitRefereeScores = (): MatchScore | null => {
    try {
      if (team1Score === 0 && team2Score === 0) {
        message.warning('Cannot save a round with no points');
        return null;
      }
      
      // Create new score entry directly from referee scoring
      const newScore: MatchScore = {
        matchScoreId: Math.floor(Math.random() * 1000) + 100,
        matchId: match?.id || 0,
        round: matchScores.length + 1,
        note: refereeNotes || `Round ${currentRound}`,
        currentHaft: refereeCurrentHalf,
        team1Score: team1Score,
        team2Score: team2Score,
      };
      
      // Add to match scores
      setMatchScores(prev => [...prev, newScore]);
      
      // Reset the referee scoring state
      setTeam1Score(0);
      setTeam2Score(0);
      setRefereeNotes('');
      setCurrentRound(prev => prev + 1);
      setScoringHistory([]);
      
      message.success('Round score submitted successfully');
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

  // Clean up localStorage
  const cleanupStorageForMatch = (): void => {
    if (match?.id) {
      localStorage.removeItem(`${MATCH_SCORES_STORAGE_KEY}_${match.id}`);
      localStorage.removeItem(`${REFEREE_SCORES_STORAGE_KEY}_${match.id}`);
    }
  };

  // Calculate if a team has game point
  const gamePoint = (() => {
    if (team1Score >= 10 && team1Score >= team2Score + 2) {
      return 1;
    } else if (team2Score >= 10 && team2Score >= team1Score + 2) {
      return 2;
    }
    return null;
  })();

  // Return value with explicit return type for better TypeScript safety
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
    getWinner
  };
};
