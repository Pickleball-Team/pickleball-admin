import { useMutation } from '@tanstack/react-query';
import Api from '../../../configs/api/api';
import { RegisterUserRequest, RoleFactory } from '../models';

const registerUser = async (user: RegisterUserRequest): Promise<void> => {
  const payload: RegisterUserRequest = {
    ...user,
    RoleId: RoleFactory.Refree,
  };
  await Api.post('Auth/register', payload);
};

export function useRegisterUser() {
  return useMutation({
    mutationFn: registerUser,
    onError: (error) => {
      console.error('Error registering user:', error);
    },
  });
}
