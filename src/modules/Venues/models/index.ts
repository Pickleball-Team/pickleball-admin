export interface Venue {
  id: number;
  name: string;
  address: string;
  capacity: number;
  urlImage: string;
  createBy: number;
}

export interface VenueRequest {
  name: string;
  address: string;
  capacity: number;
  urlImage: string;
  createBy: number;
}
