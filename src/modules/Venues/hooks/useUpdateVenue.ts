import { useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { Venue, VenueRequest } from '../models';
import { GET_ALL_VENUES } from '../constants';

const updateVenue = async (id:number,venue: VenueRequest): Promise<Venue> => {
  const response = await Api.patch<Venue>(`/Venues/UpdateVenues/${id}`, venue);
  return response.data;
};

export function useUpdateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, venue }: { id: number, venue: VenueRequest }) => updateVenue(id, venue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ALL_VENUES] });
    },
  });
}
