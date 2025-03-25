import { useState, useEffect } from 'react';
import { message } from 'antd';
import { IMatch, EndTournamentMatchDTO } from '../../../modules/Macths/models';

// Constants for localStorage
const MATCH_SCORES_STORAGE_KEY = 'pickleball_match_scores';
const REFEREE_SCORES_STORAGE_KEY = 'pickleball_referee_scores';

// Define proper interfaces for type safety
interface MatchScore {
  matchScoreId: number;
  matchId: number;
  round: number;
  note: string;
  currentHaft: number;
  team1Score: number;
  team2Score: number;
  isFromReferee?: boolean; // Flag to identify scores from referee
  setDetails?: SetScore[]; // Store set details for referee-created scores
}

interface SetScore {
  set: number;
  team1: number;
  team2: number;
  note?: string;
  currentHalf?: number;
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

export const useMatchScoring = (match: IMatch | null) => {
  const [matchScores, setMatchScores] = useState<MatchScore[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [team1Score, setTeam1Score] = useState<number>(0);
  const [team2Score, setTeam2Score] = useState<number>(0);
  const [setScores, setSetScores] = useState<SetScore[]>([]);
  const [gamePoint, setGamePoint] = useState<number | null>(null);
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
          setCurrentSet(parsedData.currentSet || 1);
          setTeam1Score(parsedData.team1Score || 0);
          setTeam2Score(parsedData.team2Score || 0);
          setSetScores(parsedData.setScores || []);
          setGamePoint(parsedData.gamePoint || null);
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
        currentSet,
        team1Score,
        team2Score,
        setScores,
        gamePoint,
        scoringHistory,
        refereeNotes,
        refereeCurrentHalf
      };
      localStorage.setItem(`${REFEREE_SCORES_STORAGE_KEY}_${match.id}`, JSON.stringify(refereeData));
    }
  }, [
    match?.id, currentRound, currentSet, team1Score, team2Score, 
    setScores, gamePoint, scoringHistory, refereeNotes, refereeCurrentHalf
  ]);

  // Calculate total scores
  const totalScores = matchScores.reduce(
    (acc, score) => ({
      team1: acc.team1 + score.team1Score,
      team2: acc.team2 + score.team2Score,
    }),
    { team1: 0, team2: 0 }
  );

  // Calculate sets won by each team
  const setsWon = setScores.reduce(
    (acc, set) => {
      if (set.team1 > set.team2) {
        return { ...acc, team1: acc.team1 + 1 };
      } else if (set.team2 > set.team1) {
        return { ...acc, team2: acc.team2 + 1 };
      }
      return acc;
    },
    { team1: 0, team2: 0 }
  );

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
    
    // Check for game point
    const newTeam1Score = team === 1 ? team1Score + points : team1Score;
    const newTeam2Score = team === 2 ? team2Score + points : team2Score;
    
    if (newTeam1Score >= 10 && newTeam1Score >= newTeam2Score + 2) {
      setGamePoint(1);
    } else if (newTeam2Score >= 10 && newTeam2Score >= newTeam1Score + 2) {
      setGamePoint(2);
    } else {
      setGamePoint(null);
    }
  };
  
  // Finalize the current set
  const finalizeSet = (): SetScore | null => {
    if (team1Score === 0 && team2Score === 0) {
      message.warning('Cannot save a set with no points');
      return null;
    }
    
    // Create the new set score
    const newSetScore: SetScore = {
      set: currentSet,
      team1: team1Score,
      team2: team2Score,
      note: refereeNotes,
      currentHalf: refereeCurrentHalf
    };
    
    // Update the setScores array
    const updatedSetScores = [...setScores, newSetScore];
    setSetScores(updatedSetScores);
    
    // Calculate current round from matchScores, accounting for temporary referee scores
    const nonRefereeScores = matchScores.filter(score => !score.isFromReferee);
    const currentRoundNumber = nonRefereeScores.length + 1;
    
    // Also create a temporary match score entry to display in match scores table
    // This helps show progress before final submission
    const tempMatchScore: MatchScore = {
      matchScoreId: Math.floor(Math.random() * 1000) + 100 + currentSet,
      matchId: match?.id || 0,
      round: currentRoundNumber,
      note: `Set ${currentSet}: ${refereeNotes || 'No notes'}`,
      currentHaft: refereeCurrentHalf,
      team1Score: team1Score,
      team2Score: team2Score,
      isFromReferee: true,
      setDetails: updatedSetScores
    };
    
    // Find if there's already a temporary match score for this round from referee
    const existingTempIndex = matchScores.findIndex(
      score => score.isFromReferee && score.round === currentRoundNumber
    );
    
    if (existingTempIndex >= 0) {
      // Replace the existing temporary score
      const updatedMatchScores = [...matchScores];
      updatedMatchScores[existingTempIndex] = tempMatchScore;
      setMatchScores(updatedMatchScores);
    } else {
      // Add a new temporary score
      setMatchScores(prev => [...prev, tempMatchScore]);
    }
    
    // Reset scores for next set
    setTeam1Score(0);
    setTeam2Score(0);
    setGamePoint(null);
    setCurrentSet(prev => prev + 1);
    setRefereeNotes('');
    
    message.success(`Set ${currentSet} completed and saved`);
    return newSetScore;
  };
  
  // Submit round scores
  const submitRoundScores = (): MatchScore | null => {
    try {
      // First finalize any current set if there are points
      if (team1Score > 0 || team2Score > 0) {
        const result = finalizeSet();
        if (!result) {
          return null; // If finalizing the set failed, abort
        }
      }
      
      if (setScores.length === 0) {
        message.warning('Please score at least one set before submitting');
        return null;
      }
      
      // Calculate total scores for the round
      const roundTotal = setScores.reduce(
        (acc, set) => ({
          team1: acc.team1 + set.team1,
          team2: acc.team2 + set.team2
        }),
        { team1: 0, team2: 0 }
      );
      
      // Calculate most frequent half used (mode)
      const halfCounts = setScores.reduce((acc, set) => {
        const half = set.currentHalf || 1;
        acc[half] = (acc[half] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      const mostFrequentHalf = Object.entries(halfCounts).sort((a, b) => b[1] - a[1])[0][0];
      
      // Compile notes from all sets
      const combinedNotes = setScores
        .filter(set => set.note)
        .map(set => `Set ${set.set}: ${set.note}`)
        .join('\n');
      
      // Find and remove any temporary match scores from referee
      const filteredMatchScores = matchScores.filter(score => !score.isFromReferee);
      
      // Calculate proper round number for the new score
      const currentRoundNumber = filteredMatchScores.length + 1;
      
      // Prepare new score data
      const newScore: MatchScore = {
        matchScoreId: Math.floor(Math.random() * 1000) + 100,
        matchId: match?.id || 0,
        round: currentRoundNumber,
        note: combinedNotes || `Round ${currentRoundNumber}: ${setScores.length} sets played`,
        currentHaft: parseInt(mostFrequentHalf),
        team1Score: roundTotal.team1,
        team2Score: roundTotal.team2,
        setDetails: [...setScores] // Store all set details for reference
      };
      
      // Add to match scores (replacing temporary referee scores)
      setMatchScores([...filteredMatchScores, newScore]);
      
      // Reset for next round
      setCurrentRound(currentRoundNumber + 1);
      setCurrentSet(1);
      setSetScores([]);
      setScoringHistory([]);
      setRefereeNotes('');
      
      message.success('Round scores submitted successfully');
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

  // Return value with explicit return type for better TypeScript safety
  return {
    // State
    matchScores,
    currentRound,
    currentSet,
    team1Score,
    team2Score,
    setScores,
    gamePoint,
    scoringHistory,
    refereeNotes,
    refereeCurrentHalf,
    totalScores,
    setsWon,
    
    // Actions
    setMatchScores,
    setRefereeNotes,
    setRefereeCurrentHalf,
    handleAddRound,
    handleEditRound,
    addPointToTeam,
    finalizeSet,
    submitRoundScores,
    undoLastScore,
    cleanupStorageForMatch
  };
};
