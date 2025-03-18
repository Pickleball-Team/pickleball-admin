import { useQuery } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { RefereeResponse } from '../models';
import { GET_ALL_REFEREES } from '../constants';

const fetchAllReferees = async (): Promise<RefereeResponse[]> => {
  const response = await Api.get<RefereeResponse[]>('/User/GetAllRefee');
  return response.data;
};

export function useGetAllReferees() {
  return useQuery<RefereeResponse[]>({
    queryKey: [GET_ALL_REFEREES],
    queryFn: fetchAllReferees,
  });
}
