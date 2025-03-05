import { useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { UpdateApprovalDTO } from '../models';

const putApprovalPlayerTournament = async ({
  id,
  isApproved,
}: UpdateApprovalDTO): Promise<UpdateApprovalDTO> => {
  const response = await Api.put(`/PlayerRegistration/ChangeStatus`, {
    registerID: id,
    isApproved,
  });
  return response.data as UpdateApprovalDTO;
};

export function useApprovalPlayerTournament() {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateApprovalDTO,
    Error,
    { id: number; isApproved: boolean }
  >({
    mutationFn: ({ id, isApproved }: UpdateApprovalDTO) =>
      putApprovalPlayerTournament({ id, isApproved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GET_ALL_TOURNAMENTS'] });
    },
    onError: (error) => {
      console.error('Error updating player registration status:', error);
    },
  });
}
