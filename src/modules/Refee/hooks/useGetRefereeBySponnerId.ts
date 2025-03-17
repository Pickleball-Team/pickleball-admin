import { useQuery } from '@tanstack/react-query';
import api from '../../../configs/api/api';
import { RefereeResponse } from '../models';
import { GET_REFEREE_BY_CODE } from '../constants';

const fetchRefereeByCode = async (code: string): Promise<RefereeResponse[]> => {
  try {
    const response = await api.get<RefereeResponse[]>(`/Refree/code/${code}`);
    return response;
  } catch (error) {
    throw new Error('Error fetching referee data');
  }
};

export function useGetRefereeBySponnerId(code: string) {
  return useQuery<RefereeResponse[]>({
    queryKey: [GET_REFEREE_BY_CODE, code],
    queryFn: () => fetchRefereeByCode(code),
    refetchInterval: 3000,
  });
}
