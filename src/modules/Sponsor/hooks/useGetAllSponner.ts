import { useQuery } from '@tanstack/react-query';
import api from '../../../configs/api/api';
import { Sponsor } from '../models';
import { GET_ALL_SPONSORS } from '../constants';

const fetchSponsors = async (): Promise<Sponsor[]> => {
  try {
    const response = await api.get('/Sponner/GetAll');
    return response.data as Sponsor[];
  } catch (error) {
    throw new Error('Error fetching sponsors');
  }
};

export function useGetAllSponsors() {
  return useQuery<Sponsor[]>({
    queryKey: [GET_ALL_SPONSORS],
    queryFn: fetchSponsors,
    refetchInterval: 3000,
  });
}
