import { useQuery } from '@tanstack/react-query';
import { User } from '../models';
import Api from '../../../configs/api/api';
import { FETCH_ALL_USERS } from '../constants';

export const fetchAllUsers = async (pageNumber: number = 1, pageSize: number = 10, isOrderByCreateAt: boolean = true): Promise<User[]> => {
  const response = await Api.get('/User/GetAllUser', {
    params: {
      PageNumber: pageNumber,
      Pagesize: pageSize,
      isOrderbyCreateAt: isOrderByCreateAt,
    },
  });
  return response.data as User[];
};

export function useFetchAllUser(pageNumber: number = 1, pageSize: number = 10, isOrderByCreateAt: boolean = true) {
  return useQuery<User[]>({
    queryKey: [FETCH_ALL_USERS, pageNumber, pageSize, isOrderByCreateAt],
    queryFn: () => fetchAllUsers(pageNumber, pageSize, isOrderByCreateAt),
    refetchInterval: 3000,
  });
}
