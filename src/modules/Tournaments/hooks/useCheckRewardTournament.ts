import { useQuery } from '@tanstack/react-query';
import { Reward } from '../models';
import api from '../../../configs/api/api';
import { GET_REWARD_TOURNAMENT } from '../constants';

const checkRewardTournament = async (tournamentId: string): Promise<Reward> => {
    try {
        const response = await api.get(`/Tourament/isAward/${tournamentId}`);
        return response.data as Reward;
    } catch (error) {
        throw new Error('Error fetching tournaments');
    }
};

export function useCheckRewardTournament(tournamentId: string) {
    return useQuery<Reward>({
        queryKey: [GET_REWARD_TOURNAMENT, tournamentId],
        queryFn: () => checkRewardTournament(tournamentId),
        refetchInterval: 3000,
        enabled: !!tournamentId,
    });
}
