import { useMutation } from '@tanstack/react-query';
import api from '../../../configs/api/api';
import { UpdateUserRequest } from '../models';

const updateUser = async (id: number, data: Partial<UpdateUserRequest>): Promise<void> => {
  try {
    await api.patch(`/User/UpdateUser/${id}`, data);
  } catch (error) {
    throw new Error('Error updating user data');
  }
};

export function useUpdateUser() {
  return useMutation<void, Error, { id: number; data: Partial<UpdateUserRequest> }>({
    mutationFn: ({ id, data }) => updateUser(id, data),
  });
}
