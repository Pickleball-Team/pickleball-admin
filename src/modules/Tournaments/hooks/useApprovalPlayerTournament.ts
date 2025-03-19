import { useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { TouramentregistrationStatus, UpdateApprovalDTO } from '../models';

const putApprovalPlayerTournament = async ({
  isApproved,
  tournamentId,
  playerId,
  partnerId,
}: UpdateApprovalDTO): Promise<any> => {
  const response = await Api.put(`/PlayerRegistration/ChangeStatus`, {
    tournamentId,
    playerId,
    partnerId,
    isApproved,
  });
  return response.data;
};

export function useApprovalPlayerTournament() {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    Error,
    UpdateApprovalDTO
  >({
    mutationFn: (params: UpdateApprovalDTO) => putApprovalPlayerTournament(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GET_ALL_TOURNAMENTS'] });
    },
    onError: (error) => {
      console.error('Error updating player registration status:', error);
    },
  });
}
