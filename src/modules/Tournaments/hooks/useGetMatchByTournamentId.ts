import { useQuery } from '@tanstack/react-query';
import { GET_TOURNAMENT_MATCH_BY_ID } from '../constants';
import { Match } from '../models';

const fetchTournamenMatchtById = async (id: number): Promise<Match[]> => {
  try {
    // const response = await api.get(`/Match/GetMatchByTouramentId/${id}`);
    // return response.data as Tournament;
    console.log(id);
    
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
