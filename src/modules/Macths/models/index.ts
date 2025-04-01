export interface IMatch {
  teamResponse: any;
  id: number;
  title: string;
  description: string;
  matchDate: string;
  venueId: number;
  status: number;
  matchCategory: number;
  matchFormat: number;
  winScore: number;
  isPublic: boolean;
  refereeId: number;
  touramentId: number;
  team1Score?: number;
  team2Score?: number;
}

export interface IMatchScope {
  matchId: number;
  round: number;
  note: string;
  currentHaft: number;
  team1Score: number;
  team2Score: number;
  logs?: string;
}

// Match score detail from API
export interface MatchScoreDetail {
  matchScoreId: number;
  round: number;
  note: string;
  currentHaft: number;
  team1Score: number;
  team2Score: number;
  logs?: string;
}

// Match details returned by the API
export interface MatchDetails {
  matchId: number;
  team1Score: number;
  team2Score: number;
  winnerId: number | null;
  loserId: number | null;
  date: string;
  urlVideoMatch: string | null;
  matchScoreDetails: MatchScoreDetail[];
}

export interface EndTournamentMatchDTO {
  matchId: number;
  round: number;
  note: string;
  currentHaft: number;
  team1Score: number;
  team2Score: number;
}

export enum WinScore {
  Eleven = 1,
  Fifteen = 2,
  TwentyOne = 3,
}

export const WinScoreOptions: Map<WinScore, number> = new Map([
  [WinScore.Eleven, 11],
  [WinScore.Fifteen, 15],
  [WinScore.TwentyOne, 21],
]);
