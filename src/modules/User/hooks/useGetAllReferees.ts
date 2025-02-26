import { useQuery } from '@tanstack/react-query';
import { User } from '../models';
import Api from '../../../configs/api/api';
import { FETCH_REFEREES } from '../constants';

export const fetchAllReferees = async (): Promise<User[]> => {
  const response = await Api.get('/User/GetAllRefee');
  return response.data as User[];
};

export function useGetAllReferees() {
  return useQuery<User[]>({
    queryKey: [FETCH_REFEREES],
    queryFn: fetchAllReferees,
  });
}
