import { useState } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '../../../configs/firebase/firebaseConfig';
import { message } from 'antd';

export const useTournamentNotes = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Write a note to Firebase for tournament approval/rejection
   * @param tournamentId - The ID of the tournament
   * @param note - The note text
   * @param action - The action taken (accept or reject)
   */
  const writeNote = async (
    tournamentId: number,
    note: string,
    action: 'accept' | 'reject'
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const noteRef = ref(database, `tournament_notes/${tournamentId}`);
      await set(noteRef, {
        action,
        note,
        timestamp: new Date().toISOString(),
        tournamentId
      });
      message.success('Note saved successfully');
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error);
      message.error('Failed to save note');
      console.error('Error writing tournament note:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get a note for a specific tournament
   * @param tournamentId - The ID of the tournament
   * @returns The note data or null if not found
   */
  const getNoteByTournamentId = async (tournamentId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const noteRef = ref(database, `tournament_notes/${tournamentId}`);
      const snapshot = await get(noteRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      return null;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Error getting tournament note:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    writeNote,
    getNoteByTournamentId,
    isLoading,
    error
  };
};