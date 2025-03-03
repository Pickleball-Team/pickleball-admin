import { useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { Venue, VenueRequest } from '../models';
import { CREATE_VENUE, GET_ALL_VENUES } from '../constants';

const createVenue = async (venue: VenueRequest): Promise<Venue> => {
  const response = await Api.post<Venue>('Venues/CreateVenues', venue);
  return response.data;
};

export function useCreateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CREATE_VENUE] });
      queryClient.invalidateQueries({ queryKey: [GET_ALL_VENUES] });
    },
  });
}
