
import { useQuery } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { Venue } from '../models';
import { GET_VENUE_ALL } from '../constants';

const fetchVenueAll = async (): Promise<Venue[]> => {
  const response = await Api.get<Venue[]>(`/Venues/GetAllVenues`);
  return response.data;
};

export function useGetVenueAll() {
  return useQuery<Venue[]>({
    queryKey: [GET_VENUE_ALL],
    queryFn: fetchVenueAll,
  });
}
