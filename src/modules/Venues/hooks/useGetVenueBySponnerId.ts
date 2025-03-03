import { useQuery } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { Venue } from '../models';
import { GET_VENUE_BY_ID } from '../constants';

const fetchVenueBySponnerId = async (id: number): Promise<Venue[]> => {
  const response = await Api.get<Venue[]>(`/Venues/GetVenueSponner/${id}`);
  return response.data;
};

export function useGetVenueBySponnerId(id: number) {
  return useQuery<Venue[]>({
    queryKey: [GET_VENUE_BY_ID, id],
    queryFn: () => fetchVenueBySponnerId(id),
  });
}
