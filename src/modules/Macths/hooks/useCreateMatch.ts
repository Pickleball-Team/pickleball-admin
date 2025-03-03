import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MatchRequest } from '../../Tournaments/models';
import Api from '../../../configs/api/api';
import { CREATE_MATCH } from '../constants';

const createMatch = async (matchData: MatchRequest): Promise<void> => {
  await Api.post('/Match', matchData);
};

export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CREATE_MATCH] });
    },
  });
}
