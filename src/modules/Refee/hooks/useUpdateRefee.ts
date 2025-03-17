import { useMutation } from '@tanstack/react-query';
import api from '../../../configs/api/api';

interface UpdateRefereeRequest {
  refreeCode?: string;
  refreeLevel?: string;
  refreeNote?: string;
  isAccept?: boolean;
}

const updateReferee = async (id: number, data: UpdateRefereeRequest): Promise<void> => {
  try {
    await api.patch(`/Refree/${id}`, data);
  } catch (error) {
    throw new Error('Error updating referee data');
  }
};

export function useUpdateReferee() {
  return useMutation<void, Error, { id: number; data: UpdateRefereeRequest }>({
    mutationFn: ({ id, data }) => updateReferee(id, data),
  });
}
