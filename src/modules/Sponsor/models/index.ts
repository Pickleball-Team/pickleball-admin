export interface Sponsor {
  sponsorId: number;
  companyName: string;
  logoUrl: string;
  urlSocial: string;
  urlSocial1: string | null;
  contactEmail: string;
  descreption: string;
  isAccept: boolean;
  joinedAt: string;
}

export interface AcceptSponsorRequest {
  sponnerId: number;
  isAccept: boolean;
}

