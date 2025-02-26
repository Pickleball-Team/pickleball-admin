import { useQuery } from '@tanstack/react-query';
import { Match, Tournament } from '../models';
import api from '../../../configs/api/api';
import { GET_TOURNAMENT_BY_ID, GET_TOURNAMENT_MATCH_BY_ID } from '../constants';
import { ApiResponse } from '../../../configs/api/apiResponses';

const fetchTournamenMatchtById = async (id: number): Promise<Match[]> => {
  try {
    // const response = await api.get(`/Match/GetMatchByTouramentId/${id}`);
    // return response.data as Tournament;

    return mockMatches;
  } catch (error) {
    throw new Error('Error fetching tournament by ID');
  }
};

export function useGetMatchByTournamentId(id: number) {
  return useQuery<Match[]>({
    queryKey: [GET_TOURNAMENT_MATCH_BY_ID, id],
    queryFn: () => fetchTournamenMatchtById(id),
  });
}

const mockMatches: Match[] = [
  {
    id: 15,
    title: 'FirstMatch',
    description: 'On time',
    matchDate: '2025-02-20T08:48:28.71',
    venueId: null,
    status: 1,
    matchCategory: 1,
    matchFormat: 1,
    winScore: 1,
    isPublic: false,
    refereeId: null,
    teams: [
      {
        id: 1,
        name: 'Team 1',
        captainId: null,
        matchingId: 15,
        members: [
          {
            id: 1,
            playerId: 2,
            teamId: 1,
            joinedAt: '2025-02-20T09:22:56.3720387',
          },
          {
            id: 2,
            playerId: 3,
            teamId: 2,
            joinedAt: '2025-02-20T09:22:56.4237211',
          },
        ],
      },
      {
        id: 2,
        name: 'Team 2',
        captainId: null,
        matchingId: 15,
        members: [
          {
            id: 2,
            playerId: 3,
            teamId: 2,
            joinedAt: '2025-02-20T09:22:56.4237211',
          },
          {
            id: 1,
            playerId: 2,
            teamId: 1,
            joinedAt: '2025-02-20T09:22:56.3720387',
          },
        ],
      },
    ],
  },
  {
    id: 15,
    title: 'FirstMatch',
    description: 'On time',
    matchDate: '2025-02-20T08:48:28.71',
    venueId: null,
    status: 1,
    matchCategory: 1,
    matchFormat: 1,
    winScore: 1,
    isPublic: false,
    refereeId: null,
    teams: [
      {
        id: 1,
        name: 'Team 1',
        captainId: null,
        matchingId: 15,
        members: [
          {
            id: 1,
            playerId: 2,
            teamId: 1,
            joinedAt: '2025-02-20T09:22:56.3720387',
          },
          {
            id: 2,
            playerId: 3,
            teamId: 2,
            joinedAt: '2025-02-20T09:22:56.4237211',
          },
        ],
      },
      {
        id: 2,
        name: 'Team 2',
        captainId: null,
        matchingId: 15,
        members: [
          {
            id: 2,
            playerId: 3,
            teamId: 2,
            joinedAt: '2025-02-20T09:22:56.4237211',
          },
          {
            id: 1,
            playerId: 2,
            teamId: 1,
            joinedAt: '2025-02-20T09:22:56.3720387',
          },
        ],
      },
    ],
  },
  {
    id: 15,
    title: 'FirstMatch',
    description: 'On time',
    matchDate: '2025-02-20T08:48:28.71',
    venueId: null,
    status: 1,
    matchCategory: 1,
    matchFormat: 1,
    winScore: 1,
    isPublic: false,
    refereeId: null,
    teams: [
      {
        id: 1,
        name: 'Team 1',
        captainId: null,
        matchingId: 15,
        members: [
          {
            id: 1,
            playerId: 2,
            teamId: 1,
            joinedAt: '2025-02-20T09:22:56.3720387',
          },
          {
            id: 2,
            playerId: 3,
            teamId: 2,
            joinedAt: '2025-02-20T09:22:56.4237211',
          },
        ],
      },
      {
        id: 2,
        name: 'Team 2',
        captainId: null,
        matchingId: 15,
        members: [
          {
            id: 2,
            playerId: 3,
            teamId: 2,
            joinedAt: '2025-02-20T09:22:56.4237211',
          },
          {
            id: 1,
            playerId: 2,
            teamId: 1,
            joinedAt: '2025-02-20T09:22:56.3720387',
          },
        ],
      },
    ],
  },
  {
    id: 15,
    title: 'FirstMatch',
    description: 'On time',
    matchDate: '2025-02-20T08:48:28.71',
    venueId: null,
    status: 1,
    matchCategory: 1,
    matchFormat: 1,
    winScore: 1,
    isPublic: false,
    refereeId: null,
    teams: [
      {
        id: 1,
        name: 'Team 1',
        captainId: null,
        matchingId: 15,
        members: [
          {
            id: 1,
            playerId: 2,
            teamId: 1,
            joinedAt: '2025-02-20T09:22:56.3720387',
          },
          {
            id: 2,
            playerId: 3,
            teamId: 2,
            joinedAt: '2025-02-20T09:22:56.4237211',
          },
        ],
      },
      {
        id: 2,
        name: 'Team 2',
        captainId: null,
        matchingId: 15,
        members: [
          {
            id: 2,
            playerId: 3,
            teamId: 2,
            joinedAt: '2025-02-20T09:22:56.4237211',
          },
          {
            id: 1,
            playerId: 2,
            teamId: 1,
            joinedAt: '2025-02-20T09:22:56.3720387',
          },
        ],
      },
    ],
  },
  {
    id: 15,
    title: 'FirstMatch',
    description: 'On time',
    matchDate: '2025-02-20T08:48:28.71',
    venueId: null,
    status: 1,
    matchCategory: 1,
    matchFormat: 1,
    winScore: 1,
    isPublic: false,
    refereeId: null,
    teams: [
      {
        id: 1,
        name: 'Team 1',
        captainId: null,
        matchingId: 15,
        members: [
          {
            id: 1,
            playerId: 2,
            teamId: 1,
            joinedAt: '2025-02-20T09:22:56.3720387',
          },
          {
            id: 2,
            playerId: 3,
            teamId: 2,
            joinedAt: '2025-02-20T09:22:56.4237211',
          },
        ],
      },
      {
        id: 2,
        name: 'Team 2',
        captainId: null,
        matchingId: 15,
        members: [
          {
            id: 2,
            playerId: 3,
            teamId: 2,
            joinedAt: '2025-02-20T09:22:56.4237211',
          },
          {
            id: 1,
            playerId: 2,
            teamId: 1,
            joinedAt: '2025-02-20T09:22:56.3720387',
          },
        ],
      },
    ],
  },
  {
    id: 15,
    title: 'FirstMatch',
    description: 'On time',
    matchDate: '2025-02-20T08:48:28.71',
    venueId: null,
    status: 1,
    matchCategory: 1,
    matchFormat: 1,
    winScore: 1,
    isPublic: false,
    refereeId: null,
    teams: [
      {
        id: 1,
        name: 'Team 1',
        captainId: null,
        matchingId: 15,
        members: [
          {
            id: 1,
            playerId: 2,
            teamId: 1,
            joinedAt: '2025-02-20T09:22:56.3720387',
          },
          {
            id: 2,
            playerId: 3,
            teamId: 2,
            joinedAt: '2025-02-20T09:22:56.4237211',
          },
        ],
      },
      {
        id: 2,
        name: 'Team 2',
        captainId: null,
        matchingId: 15,
        members: [
          {
            id: 2,
            playerId: 3,
            teamId: 2,
            joinedAt: '2025-02-20T09:22:56.4237211',
          },
          {
            id: 1,
            playerId: 2,
            teamId: 1,
            joinedAt: '2025-02-20T09:22:56.3720387',
          },
        ],
      },
    ],
  },
];
