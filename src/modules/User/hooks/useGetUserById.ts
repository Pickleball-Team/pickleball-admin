import { useQuery } from '@tanstack/react-query';
import { User } from '../models';
import Api from '../../../configs/api/api';
import { FETCH_ME } from '../constants';

export const fetchUserById = async (id: number): Promise<User> => {
  const response = await Api.get(`/User/GetUserById/${id}`);
  return response.data as User;
};

export function useGetUserById(id: number) {
  return useQuery<User>({
    queryKey: [FETCH_ME, id],
    queryFn: () => fetchUserById(id),
  });
}
