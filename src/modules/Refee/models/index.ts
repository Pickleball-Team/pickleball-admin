import { User } from "../../User/models";

export interface RefereeResponse {
  refreeId: number;
  user: User;
  refreeCode: string;
  refreeLevel: string | null;
  refreeNote: string | null;
  createdAt: string;
  lastUpdatedAt: string;
  isAccept: boolean;
  tournamentReferees: any;
}
