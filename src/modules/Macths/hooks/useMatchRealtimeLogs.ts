import { useEffect, useState, useCallback } from 'react';
import {
  getDatabase,
  ref,
  onValue,
  push,
  remove,
  set,
} from 'firebase/database';
import { database } from '../../../configs/firebase/firebaseConfig';

export type LogEntry = {
  team: number;
  points: number;
  timestamp: string;
};

export function useMatchRealtimeLogs(matchId: number, round: number) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const path = `match_logs/match_${matchId}/round_${round}`;

  // Fetch logs from Firebase Realtime DB
  useEffect(() => {
    if (!matchId || !round) {
      console.warn("Invalid matchId or round provided to useMatchRealtimeLogs");
      setLogs([]);
      return () => {};
    }

    try {
      const dbRef = ref(database, path);
      const unsubscribe = onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setLogs([]);
        } else {
          const parsedLogs = Object.values(data) as LogEntry[];
          setLogs(parsedLogs);
        }
      }, (error) => {
        console.error("Firebase database error:", error);
        setLogs([]);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up Firebase listener:", error);
      return () => {};
    }
  }, [matchId, round, path]);

  // Push new log entry
  const addLog = useCallback(
    (team: number, points: number = 1) => {
      if (!matchId || !round) {
        console.warn("Cannot add log: Invalid matchId or round");
        return;
      }
      
      if (![1, 2].includes(team) || typeof points !== 'number') {
        console.warn("Invalid team or points value:", { team, points });
        return;
      }

      try {
        const newLog: LogEntry = {
          team,
          points,
          timestamp: new Date().toISOString(),
        };

        const dbRef = ref(database, path);
        push(dbRef, newLog);
      } catch (error) {
        console.error("Error adding log to Firebase:", error);
      }
    },
    [matchId, round, path]
  );

  // Remove last log entry
  const undoLastLog = useCallback(() => {
    if (!matchId || !round) {
      console.warn("Cannot undo log: Invalid matchId or round");
      return;
    }
    
    try {
      const dbRef = ref(database, path);
      onValue(
        dbRef,
        (snapshot) => {
          const data = snapshot.val();
          if (!data) return;

          const keys = Object.keys(data);
          if (keys.length === 0) return;

          const lastKey = keys[keys.length - 1];
          const lastRef = ref(database, `${path}/${lastKey}`);
          remove(lastRef);
        },
        { onlyOnce: true }
      );
    } catch (error) {
      console.error("Error undoing last log in Firebase:", error);
    }
  }, [matchId, round, path]);

  // Clear all logs in current round
  const resetLogs = useCallback(() => {
    if (!matchId || !round) {
      console.warn("Cannot reset logs: Invalid matchId or round");
      return;
    }

    try {
      const dbRef = ref(database, path);
      set(dbRef, null);
    } catch (error) {
      console.error("Error resetting logs in Firebase:", error);
    }
  }, [matchId, round, path]);

  // Calculate score for both teams
  const calculateScoresFromLogs = useCallback(() => {
    let team1 = 0;
    let team2 = 0;

    if (!logs || logs.length === 0) {
      return { team1, team2 };
    }

    logs.forEach((log) => {
      if (!log) return;
      
      if (log.team === 1 && typeof log.points === 'number') {
        team1 += log.points;
      } else if (log.team === 2 && typeof log.points === 'number') {
        team2 += log.points;
      }
    });

    // Ensure scores don't go below zero
    team1 = Math.max(0, team1);
    team2 = Math.max(0, team2);

    return { team1, team2 };
  }, [logs]);

  return {
    logs,
    addLog,
    undoLastLog,
    resetLogs,
    calculateScoresFromLogs,
  };
}
