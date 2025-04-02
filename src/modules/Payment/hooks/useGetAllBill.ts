import { useQuery } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { Bill } from '../models';
import { GET_ALL_BILLS } from '../constants';

/**
 * Fetches all payment bills from the VN-Pay endpoint
 */
const fetchAllBills = async (): Promise<Bill[]> => {
  const response = await Api.get<Bill[]>(`/payment/vn-pay/GetAll`);
  return response.data;
};

/**
 * Hook to query all payment bills from VN-Pay
 */
export function useGetAllBill() {
  return useQuery<Bill[], Error>({
    queryKey: [GET_ALL_BILLS],
    queryFn: fetchAllBills,
    refetchInterval: 3000,
  });
}
