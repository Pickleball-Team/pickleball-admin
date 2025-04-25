import { useQuery } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { RankPlayer } from '../models'; // Đảm bảo đúng path file chứa RankPlayer

export const GET_LEADERBOARD_BY_TOURNAMENT_ID =
  'GET_LEADERBOARD_BY_TOURNAMENT_ID';

// Fetch function
const fetchLeaderboardByTournamentId = async (
  tournamentId: number
): Promise<RankPlayer[]> => {
  try {
    const response = await Api.get(
      `/Ranking/LeaderBoardTourament/${tournamentId}`
    );
    return response.data as RankPlayer[];
  } catch (error) {
    throw new Error('Error fetching leaderboard by tournament ID');
  }
};

// Hook
export function useGetLeaderboardByTournamentId(tournamentId: number) {
  return useQuery<RankPlayer[]>({
    queryKey: [GET_LEADERBOARD_BY_TOURNAMENT_ID, tournamentId],
    queryFn: () => fetchLeaderboardByTournamentId(tournamentId),
    enabled: !!tournamentId,
    refetchInterval: 3000,
  });
}
