export interface IMatch {
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
}
