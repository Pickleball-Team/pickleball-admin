import { useQuery } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { GET_MATCH_DETAILS } from '../constants';
import { MatchDetails } from '../models';

/**
 * Fetches detailed information for a specific match
 *
 * @param matchId - ID of the match to fetch details for
 * @returns Match details including scores and round information
 */
const fetchMatchDetails = async (matchId: number): Promise<MatchDetails> => {
  try {
    const response = await Api.get<MatchDetails>(
      `/Match/GetMatchDetails/${matchId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching match details: ${error}`);
  }
};

/**
 * Hook to fetch and manage match details data
 *
 * @param matchId - ID of the match to fetch details for
 */
export function useGetMatchDetails(matchId: number) {
  return useQuery<MatchDetails>({
    queryKey: [GET_MATCH_DETAILS, matchId],
    queryFn: () => fetchMatchDetails(matchId),
    enabled: !!matchId,
  });
}
