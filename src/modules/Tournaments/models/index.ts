export interface Tournament {
  id: number;
  status: string;
  name: string;
  location: string;
  maxPlayer: number;
  description: string | null;
  banner: string;
  note: string;
  totalPrize: number;
  startDate: string;
  endDate: string;
  type: string;
  organizerId: number;
  isAccept: boolean;
  touramentDetails: TournamentDetail[];
  registrationDetails: RegistrationDetail[];
}

export interface TournamentDetail {
  id: number;
  playerId1: number;
  playerId2: number;
  playerId3: number;
  playerId4: number;
  scheduledTime: string;
  score: string;
  result: string;
}

export interface RegistrationDetail {
  id: number;
  playerId: number;
  paymentId: number;
  registeredAt: string;
  isApproved: boolean;
  playerDetails: PlayerDetail;
}

export interface PlayerDetail {
  firstName: string;
  lastName: string;
  secondName: string | null;
  email: string;
  ranking: number;
  avatarUrl: string;
}

export type TournamentRequest = Omit<Tournament, 'id' | 'status' | 'isAccept' | 'touramentDetails' | 'registrationDetails'>;

export enum TournamentType {
  Singles = 'Singles',
  Doubles = 'Doubles',
}

export interface Member {
  playerDetails: any;
  id: number;
  playerId: number;
  teamId: number;
  joinedAt: string;
}

export interface Team {
  id: number;
  name: string;
  captainId: number | null;
  matchingId: number;
  members: Member[];
}

export interface Match {
  id: number;
  title: string;
  description: string;
  matchDate: string;
  venueId: number | null;
  status: number;
  matchCategory: number;
  matchFormat: number;
  winScore: number;
  isPublic: boolean;
  refereeId: number | null;
  teamResponse: Team[];
}

export interface MatchRequest {
  title: string;
  description: string;
  matchDate: string;
  venueId?: number;
  status: number;
  matchCategory: number;
  matchFormat: number;
  winScore: number;
  isPublic: boolean;
  roomOnwer: number; // Note the typo here
  player1Id: number;
  player2Id?: number;
  player3Id?: number;
  player4Id?: number;
  refereeId?: number;
  tournamentId?: number;
}

export interface UpdateApprovalDTO {
  id: number;
  isApproved: boolean;
}
