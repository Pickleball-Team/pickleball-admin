import { useQuery } from '@tanstack/react-query';
import { GET_ALL_TOURNAMENTS } from '../../Macths/constants';
import { Tournament } from '../models';
import api from '../../../configs/api/api';

const fetchTournaments = async (): Promise<Tournament[]> => {
  try {
    const response = await api.get('/Tourament/GetAllTournament');
    return response.data as Tournament[];

  } catch (error) {
    throw new Error('Error fetching tournaments');
  }
};

export function useGetAllTournaments() {
  return useQuery<Tournament[]>({
    queryKey: [GET_ALL_TOURNAMENTS],
    queryFn: fetchTournaments,
    refetchInterval: 3000,
  });
}
