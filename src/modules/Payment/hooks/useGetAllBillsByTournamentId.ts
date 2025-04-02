import { useQuery } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { Bill } from '../models';
import { GET_ALL_BILLS_BY_TOURNAMENT_ID } from '../constants';

const fetchAllBillsByTournamentId = async (
  tournamentId: number
): Promise<Bill[]> => {
  const response = await Api.get<Bill[]>(
    `/payment/vn-pay/GetAllBillByTouramentId/${tournamentId}`
  );
  return response.data;
};

export function useGetAllBillsByTournamentId(tournamentId: number) {
  return useQuery<Bill[]>({
    queryKey: [GET_ALL_BILLS_BY_TOURNAMENT_ID, tournamentId],
    queryFn: () => fetchAllBillsByTournamentId(tournamentId),
    enabled: !!tournamentId,
    refetchInterval: 3000,
  });
}
