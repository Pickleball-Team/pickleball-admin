import { useMutation } from '@tanstack/react-query';
import api from '../../../configs/api/api';
import { message } from 'antd';
import { CreateRulePayload, CreateRuleResponse } from '../models';



const createRule = async (newRule: CreateRulePayload): Promise<CreateRuleResponse> => {
  try {
    const response = await api.post('/rules/create', newRule);
    return response.data as CreateRuleResponse;
  } catch (error) {
    throw new Error('Error creating rule');
  }
};

export function useCreateRule() {
  return useMutation<CreateRuleResponse, Error, CreateRulePayload>({
    mutationFn: createRule,
    onSuccess: (data) => {
      message.success(data.message);
    },
    onError: () => {
      message.error('Failed to create rule');
    },
  });
}