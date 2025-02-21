import { useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { GET_ALL_SPONSORS } from '../constants';
import { AcceptSponsorRequest } from '../models';

const acceptSponsor = async (request: AcceptSponsorRequest): Promise<void> => {
  await Api.post('Sponner/AcceptSponser', request);
};

export function useAcceptSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptSponsor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ALL_SPONSORS] });
    },
  });
}
