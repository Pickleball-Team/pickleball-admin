import { useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { IMatch } from '../models';

const updateMatch = async (id: number, data: Partial<IMatch>): Promise<IMatch> => {
  const response = await Api.patch(`/Match/admin/room/${id}`, data);
  return response.data as IMatch;
};

export function useUpdateMatch() {
  const queryClient = useQueryClient();
  return useMutation<IMatch, Error, { id: number; data: Partial<IMatch> }>({
    mutationFn: ({ id, data }) => updateMatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GET_ALL_MATCHES'] });
    },
    onError: (error) => {
      console.error('Error updating match:', error);
    },
  });
}