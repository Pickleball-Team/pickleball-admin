import { useQuery } from '@tanstack/react-query';
import api from '../../../configs/api/api';

import { GET_ALL_RULES } from '../constants';
import { RulesResponse } from '../models';

const fetchRules = async (): Promise<RulesResponse> => {
  try {
    const response = await api.get('/rules');
    return response.data as RulesResponse;
  } catch (error) {
    throw new Error('Error fetching rules');
  }
};

export function useGetAllRules() {
  return useQuery<RulesResponse>({
    queryKey: [GET_ALL_RULES],
    queryFn: fetchRules,
    refetchInterval: 3000,
  });
}
