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
    const dbRef = ref(database, path);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setLogs([]);
      } else {
        const parsedLogs = Object.values(data) as LogEntry[];
        setLogs(parsedLogs);
      }
    });
    return () => unsubscribe();
  }, [matchId, round]);

  // Push new log entry
  const addLog = useCallback(
    (team: number, points: number = 1) => {
      if (![1, 2].includes(team) || typeof points !== 'number') return;

      const newLog: LogEntry = {
        team,
        points,
        timestamp: new Date().toISOString(),
      };

      const dbRef = ref(database, path);
      push(dbRef, newLog);
    },
    [matchId, round]
  );

  // Remove last log entry
  const undoLastLog = useCallback(() => {
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
  }, [matchId, round]);

  // Clear all logs in current round
  const resetLogs = useCallback(() => {
    const dbRef = ref(database, path);
    set(dbRef, null);
  }, [matchId, round]);

  // Optional: Calculate score for both teams
  const calculateScoresFromLogs = useCallback(() => {
    let team1 = 0;
    let team2 = 0;

    logs.forEach((log) => {
      if (log.team === 1) team1 += log.points;
      else if (log.team === 2) team2 += log.points;
    });

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
