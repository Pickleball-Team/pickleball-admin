import { useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { Tournament, TournamentRequest } from '../models';
import { CREATE_TOURNAMENT, GET_ALL_TOURNAMENTS } from '../../Macths/constants';

const createTournament = async (
  tournament: TournamentRequest
): Promise<Tournament> => {
  const response = await Api.post<Tournament>('Tourament/Create', tournament);
  return response.data;
};

export function useCreateTournament() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CREATE_TOURNAMENT] });
      queryClient.invalidateQueries({ queryKey: [GET_ALL_TOURNAMENTS] });
    },
  });
  
  return {
    ...mutation,
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
