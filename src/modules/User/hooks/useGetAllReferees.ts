import { useQuery } from '@tanstack/react-query';
import { User } from '../models';
import Api from '../../../configs/api/api';
import { FETCH_REFEREES } from '../constants';
import { RefereeResponse } from '../../Refee/models';

export const fetchAllReferees = async (): Promise<RefereeResponse[]> => {
  const response = await Api.get('/User/GetAllRefee');
  return response.data as RefereeResponse[];
};

export function useGetAllReferees() {
  return useQuery<RefereeResponse[]>({
    queryKey: [FETCH_REFEREES],
    queryFn: fetchAllReferees,
    refetchInterval: 3000,
  });
}
