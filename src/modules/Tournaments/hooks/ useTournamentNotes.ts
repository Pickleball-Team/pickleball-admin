import { getDatabase, ref, set, get, child } from 'firebase/database';

export interface TournamentNote {
  action: 'accept' | 'reject';
  note: string;
  timestamp: string;
}

export function useTournamentNotes() {
  const db = getDatabase();

  const writeNote = async (
    tournamentId: number,
    action: 'accept' | 'reject',
    note: string
  ): Promise<void> => {
    const noteRef = ref(db, `tournament_notes/${tournamentId}`);
    await set(noteRef, {
      action,
      note,
      timestamp: new Date().toISOString(),
    });
  };

  const getNoteByTournamentId = async (
    tournamentId: number
  ): Promise<TournamentNote | null> => {
    const noteRef = ref(db);
    const snapshot = await get(
      child(noteRef, `tournament_notes/${tournamentId}`)
    );
    if (snapshot.exists()) {
      return snapshot.val() as TournamentNote;
    } else {
      return null;
    }
  };

  return {
    writeNote,
    getNoteByTournamentId,
  };
}
