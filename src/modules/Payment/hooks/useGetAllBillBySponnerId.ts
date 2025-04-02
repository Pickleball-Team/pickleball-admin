import { useQuery } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { Bill } from '../models';


/**
 * Fetches all payment bills for a specific sponsor
 */
const fetchSponsorBills = async (sponnerId: number): Promise<Bill[]> => {
  const response = await Api.get<Bill[]>(`/payment/vn-pay/GetAllBillBySponnerId/${sponnerId}`);
  return response.data as Bill[]; // Extract bills array from data property
};

/**
 * Hook to query payment bills for a specific sponsor
 */
export function useGetAllBillBySponnerId(sponnerId: number) {
  return useQuery<Bill[], Error>({
    queryKey: ['sponsorBills', sponnerId],
    queryFn: () => fetchSponsorBills(sponnerId),
    enabled: !!sponnerId, // Only run query if sponnerId is provided
    refetchInterval: 3000,
  });
}
