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
}

export interface EndTournamentMatchDTO extends IMatchScope {}

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
