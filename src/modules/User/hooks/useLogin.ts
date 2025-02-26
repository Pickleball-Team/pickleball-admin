import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import Api from '../../../configs/api/api';
import { LoginRequest, LoginResponse } from '../models';
import { isAuth, setUser } from '../../../redux/authencation/slice';

// integration with redux for login user
const login = async (request: LoginRequest): Promise<LoginResponse> => {
  const response = await Api.post('Auth/login', request);
  const data: LoginResponse = response.data as LoginResponse;
  if (data.tokenString) {
    localStorage.setItem('token', JSON.stringify(data.tokenString));
  }
  return data;
};

export function useLogin() {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      dispatch(isAuth());
    },
    onError: (error) => {
      console.error('Error logging in:', error);
    },
  });
}