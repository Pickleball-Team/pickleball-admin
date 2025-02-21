export interface Tournament {
  status: string;
  name: string;
  location: string;
  maxPlayer: number;
  description: string;
  banner: string;
  note: string;
  totalPrize: number;
  startDate: string;
  endDate: string;
  type: string;
  organizerId: number;
}

export type TournamentRequest = Omit<Tournament, 'id' | 'status' | 'isAccept' | 'touramentDetails' | 'registrationDetails'>;
