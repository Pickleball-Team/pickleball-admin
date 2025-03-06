import { useMutation } from '@tanstack/react-query';
import api from '../../../configs/api/api';
import { message } from 'antd';

interface DeleteRulePayload {
  RuleId: number;
}

interface DeleteRuleResponse {
  message: string;
}

const deleteRule = async ({ RuleId }: DeleteRulePayload): Promise<DeleteRuleResponse> => {
  try {
    const response = await api.delete(`/rules/delete?RuleId=${RuleId}`);
    return response.data as DeleteRuleResponse;
  } catch (error) {
    throw new Error('Error deleting rule');
  }
};

export function useDeleteRule() {
  return useMutation<DeleteRuleResponse, Error, DeleteRulePayload>({
    mutationFn: deleteRule,
    onSuccess: (data) => {
      message.success(data.message);
    },
    onError: () => {
      message.error('Failed to delete rule');
    },
  });
}
