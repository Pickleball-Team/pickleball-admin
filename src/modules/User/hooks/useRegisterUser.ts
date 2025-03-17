import { useMutation } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { RegisterUserRequest, RoleFactory } from '../models';

const registerRefereesUser = async (user: RegisterUserRequest): Promise<void> => {
  const payload: RegisterUserRequest = {
    ...user,
    RoleId: RoleFactory.Refree,
  };
  await Api.post('/User/create-referee', payload);
};

export function useRegisterRefereesUser() {
  return useMutation({
    mutationFn: registerRefereesUser,
    onError: (error) => {
      console.error('Error registering user:', error);
    },
  });
}
