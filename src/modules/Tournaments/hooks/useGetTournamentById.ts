import { useQuery } from '@tanstack/react-query';
import api from '../../../configs/api/api';
import { GET_TOURNAMENT_BY_ID } from '../constants';
import { Tournament } from '../models';

const fetchTournamentById = async (id: number) => {
  try {
    const response = await api.get(`/Tourament/GetTournamentById/${id}`);
    return response.data as Tournament;
  } catch (error) {
    throw new Error('Error fetching tournament by ID');
  }
};

export function useGetTournamentById(id: number)
{
  return useQuery({
    queryKey: [GET_TOURNAMENT_BY_ID, id],
    queryFn: () => fetchTournamentById(id),
  });
}
