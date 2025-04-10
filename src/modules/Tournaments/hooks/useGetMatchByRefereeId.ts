import { useQuery } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { Match } from '../models';

export const GET_MATCH_BY_REFEREE_ID = 'GET_MATCH_BY_REFEREE_ID';

const fetchMatchByRefereeId = async (refereeId: number): Promise<Match[]> => {
  try {
    console.log("heeree");
    
    const response = await Api.get(`/Refree/GetMatchByRefeeId/${refereeId}`);
    return response.data as Match[];
  } catch (error) {
    throw new Error('Error fetching matches by referee ID');
  }
};

export function useGetMatchByRefereeId(refereeId: number) {
  return useQuery<Match[]>({
    queryKey: [GET_MATCH_BY_REFEREE_ID, refereeId],
    queryFn: () => fetchMatchByRefereeId(refereeId),
    enabled: !!refereeId,
    refetchInterval: 3000, // Optional: keep if you want auto-polling
  });
}

