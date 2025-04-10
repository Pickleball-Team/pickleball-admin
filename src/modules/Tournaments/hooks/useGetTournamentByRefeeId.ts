import { useQuery } from '@tanstack/react-query';
import api from '../../../configs/api/api';
import { ApiResponse } from '../../../configs/api/apiResponses';
import { Tournament } from '../models';

// Define a constant for the query key
export const GET_REFEER_CAMPAIGNS_BY_SPONSOR_ID =
  'GET_REFEER_CAMPAIGNS_BY_SPONSOR_ID';

/**
 * Fetches all refeer campaigns by a specific sponsor ID
 */
const fetchTournamentByRefeeId = async (
  sponsorId: number
): Promise<Tournament[]> => {
  try {
    const response = await api.get<ApiResponse<Tournament[]>>(
      `/Refree/GetTournamentByRefeeId/${sponsorId}`
    );
    if (response.data.data) {
      return response.data.data;
    }
    return response.data as unknown as Tournament[];
  } catch (error) {
    throw new Error(`Error fetching refeer campaigns by sponsor ID: ${error}`);
  }
};

/**
 * Hook to query refeer campaigns by sponsor ID
 */
export function useGetTournamentByRefeeId(sponsorId: number) {
  return useQuery({
    queryKey: [GET_REFEER_CAMPAIGNS_BY_SPONSOR_ID, sponsorId],
    queryFn: () => fetchTournamentByRefeeId(sponsorId),
    enabled: !!sponsorId,
  });
}
