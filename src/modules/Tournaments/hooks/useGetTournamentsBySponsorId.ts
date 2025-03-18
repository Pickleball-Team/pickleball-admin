import { useQuery } from '@tanstack/react-query';
import api from '../../../configs/api/api';
import { Tournament } from '../models';
import { ApiResponse } from '../../../configs/api/apiResponses';

// Define a constant for the query key
export const GET_TOURNAMENTS_BY_SPONSOR_ID = 'GET_TOURNAMENTS_BY_SPONSOR_ID';

// API response structure (if it follows your standard pattern)

/**
 * Fetches all tournaments by a specific sponsor ID
 */
const fetchTournamentsBySponsorId = async (
  sponsorId: number
): Promise<Tournament[]> => {
  try {
    const response = await api.get<ApiResponse<Tournament[]>>(
      `/Tourament/GetAllTouramentBySponnerId/${sponsorId}`
    );
    // Check if the response follows your API structure
    if (response.data.data) {
      return response.data.data;
    }
    // If not wrapped in a data property, return the response directly
    return response.data as unknown as Tournament[];
  } catch (error) {
    throw new Error(`Error fetching tournaments by sponsor ID: ${error}`);
  }
};

/**
 * Hook to query tournaments by sponsor ID
 */
export function useGetTournamentsBySponsorId(sponsorId: number) {
  return useQuery({
    queryKey: [GET_TOURNAMENTS_BY_SPONSOR_ID, sponsorId],
    queryFn: () => fetchTournamentsBySponsorId(sponsorId),
    enabled: !!sponsorId, // Only run query if sponsorId is provided
  });
}
