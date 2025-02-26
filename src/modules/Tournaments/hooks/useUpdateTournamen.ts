import { useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { Tournament } from '../models';

const updateTournament = async (
  id: number,
  data: Partial<Tournament>
): Promise<Tournament> => {
  const response = await Api.patch(`/Tourament/UpdateTournament/${id}`, data);
  return response.data as Tournament;
};

export function useUpdateTournament() {
  const queryClient = useQueryClient();
  return useMutation<
    Tournament,
    Error,
    { id: number; data: Partial<Tournament> }
  >({
    mutationFn: ({ id, data }) => updateTournament(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GET_ALL_TOURNAMENTS'] });
    },
    onError: (error) => {
      console.error('Error updating tournament:', error);
    },
  });
}
