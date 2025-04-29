import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../configs/api/api';
import { GET_TOURNAMENT_BY_ID } from '../constants';
import { GET_LEADERBOARD_BY_TOURNAMENT_ID } from './useGetLeaderboardByTournamentId';


const rankRewardTournament = async (tournamentId: string) => {
    try {
        const response = await api.get(`/Ranking/giveAward/${tournamentId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error distributing rewards');
    }
};

export function useRankRewardTournament() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (tournamentId: string) => rankRewardTournament(tournamentId),
        onSuccess: (_, tournamentId) => {
            // Invalidate and refetch tournament data
            queryClient.invalidateQueries({ queryKey: [GET_TOURNAMENT_BY_ID, Number(tournamentId)] });
            
            // Invalidate and refetch leaderboard data
            queryClient.invalidateQueries({ queryKey: [GET_LEADERBOARD_BY_TOURNAMENT_ID, tournamentId] });
        }
    });
}
