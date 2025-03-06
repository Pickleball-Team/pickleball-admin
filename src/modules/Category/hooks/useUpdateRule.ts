import { useMutation } from '@tanstack/react-query';
import api from '../../../configs/api/api';
import { message } from 'antd';
import { UpdateRulePayload, UpdateRuleResponse } from '../models';

const updateRule = async (
  updatedRule: UpdateRulePayload
): Promise<UpdateRuleResponse> => {
  try {
    const response = await api.patch('/rules/edit', updatedRule);
    return response.data as UpdateRuleResponse;
  } catch (error) {
    throw new Error('Error updating rule');
  }
};

export function useUpdateRule() {
  return useMutation<UpdateRuleResponse, Error, UpdateRulePayload>({
    mutationFn: updateRule,
    onSuccess: (data) => {
      message.success(data.message);
    },
    onError: () => {
      message.error('Failed to update rule');
    },
  });
}
