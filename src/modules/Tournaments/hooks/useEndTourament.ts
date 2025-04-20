import api from '../../../configs/api/api';
import { useMutation } from '@tanstack/react-query';

/**
 * Calls API to end a specific tournament by ID
 * @param tournamentId The ID of the tournament to end
 */
export const endTournament = async (tournamentId: number): Promise<void> => {
  try {
    await api.put(`/Tourament/EndTourament/${tournamentId}`);
  } catch (error) {
    throw new Error(`Failed to end tournament: ${error}`);
  }
};

/**
 * React Query hook to end a tournament
 */
export function useEndTournament() {
  return useMutation({
    mutationFn: (tournamentId: number) => endTournament(tournamentId),
  });
}
