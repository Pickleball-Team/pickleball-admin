import { useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { EndTournamentMatchDTO } from '../models';
import { GET_TOURNAMENT_MATCH_BY_ID } from '../../Tournaments/constants';

const endTournamentMatch = async (
  data: EndTournamentMatchDTO
): Promise<any> => {
  const response = await Api.post('/Match/EndMatchTourament', data);
  return response.data;
};

export function useEndTournamentMatch() {
  const queryClient = useQueryClient();
  const mutation = useMutation<any, Error, EndTournamentMatchDTO>({
    mutationFn: (data) => endTournamentMatch(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [GET_TOURNAMENT_MATCH_BY_ID] });
    },
    onError: (error) => {
      console.error('Error ending match:', error);
    },
    retry: 3,
    retryDelay: 2000, // 2 seconds between retries
  });

  return mutation;
}
