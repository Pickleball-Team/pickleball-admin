import { useQuery } from '@tanstack/react-query';
import api from '../../../configs/api/api';
import { GET_RULE_OF_AWARD } from '../constants';
import { RuleOfAward } from '../models';

const fetchRuleOfAward = async () => {
    try {
        const response = await api.get('/Ranking/GetRuleOfAward');
        return response.data as RuleOfAward[];
    } catch (error) {
        throw new Error('Error fetching rule of award');
    }
};

export function useGetRuleOfAward() {
    return useQuery({
        queryKey: [GET_RULE_OF_AWARD],
        queryFn: fetchRuleOfAward,
        staleTime: 300000, // 5 minutes
    });
}
