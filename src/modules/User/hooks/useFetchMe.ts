import { useQuery } from '@tanstack/react-query';
import { User } from '../models';
import Api from '../../../configs/api/api';
import { FETCH_ME } from '../constants';

const fetchMe = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await Api.get(
    `http://localhost:5098/api/Auth/GetUserByToken/${JSON.parse(token)}`
  );
  return response;
};

export function useFetchMe() {
  return useQuery({
    queryKey: [FETCH_ME],
    queryFn: fetchMe,
  });
}
