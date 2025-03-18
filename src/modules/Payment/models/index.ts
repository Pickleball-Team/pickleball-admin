export interface Bill {
  userId: number;
  note: string;
  type: number;
  paymentMethod: any;
  id: number;
  tournamentId: number;
  amount: number;
  status: string;
  createdDate: string;
  paymentDate?: string;
  transactionId?: string;
}
