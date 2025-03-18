import { useQuery } from '@tanstack/react-query';
import { GET_TOURNAMENT_MATCH_BY_ID } from '../constants';
import { Match } from '../models';
import Api from '../../../configs/api/api';

const fetchTournamenMatchtById = async (id: number): Promise<Match[]> => {
  try {
    const response = await Api.get(`/Match/GetMatchByTouramentId/${id}`);
    return response.data as Match[];
  } catch (error) {
    throw new Error('Error fetching tournament by ID');
  }
};

export function useGetMatchByTournamentId(id: number) {
  return useQuery<Match[]>({
    queryKey: [GET_TOURNAMENT_MATCH_BY_ID, id],
    queryFn: () => fetchTournamenMatchtById(id),
  });
}
