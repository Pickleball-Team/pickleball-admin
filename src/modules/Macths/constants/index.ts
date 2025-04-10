export const CREATE_TOURNAMENT = 'CREATE_TOURNAMENT';
export const TOURNAMENTS = 'tournaments';

export const GET_ALL_TOURNAMENTS = 'GET_ALL_TOURNAMENTS';
export const GET_MATCH_DETAILS = 'GET_MATCH_DETAILS';

export const CREATE_MATCH = 'CREATE_MATCH';

// Match statuses
export const MATCH_STATUS_SCHEDULED = 1;
export const MATCH_STATUS_ONGOING = 2;
export const MATCH_STATUS_COMPLETED = 3;
export const MATCH_STATUS_DISABLED = 4;

// Match formats enum to match backend
export enum MatchFormat {
  SingleMale = 1,
  SingleFemale = 2,
  DoubleMale = 3,
  DoubleFemale = 4,
  DoubleMix = 5,
}

// Match format mapping by format ID
export const MATCH_FORMAT_NAMES: Record<number, string> = {
  [MatchFormat.SingleMale]: "Single Male",
  [MatchFormat.SingleFemale]: "Single Female",
  [MatchFormat.DoubleMale]: "Double Male",
  [MatchFormat.DoubleFemale]: "Double Female",
  [MatchFormat.DoubleMix]: "Double Mix",
};

// Tournament type to match format mapping - handles different API naming conventions
export const TOURNAMENT_TYPE_TO_FORMAT: Record<string, MatchFormat> = {
  // Basic types
  'Singles': MatchFormat.SingleMale,
  'Doubles': MatchFormat.DoubleMale,
  'Mixed': MatchFormat.DoubleMix,
  
  // Gender-specific types
  'SinglesMale': MatchFormat.SingleMale,
  'SinglesFemale': MatchFormat.SingleFemale,
  'DoublesMale': MatchFormat.DoubleMale,
  'DoublesFemale': MatchFormat.DoubleFemale,
  'DoublesMix': MatchFormat.DoubleMix,
};

// Match status enum
export enum MatchStatus {
  Scheduled = 1,
  Ongoing = 2,
  Completed = 3,
  Disabled = 4,
}

// Match status names
export const MATCH_STATUS_NAMES: Record<number, string> = {
  [MatchStatus.Scheduled]: "Scheduled",
  [MatchStatus.Ongoing]: "Ongoing",
  [MatchStatus.Completed]: "Completed",
  [MatchStatus.Disabled]: "Disabled",
};

// Match category enum
export enum MatchCategory {
  Competitive = 1,
  Custom = 2,
  Tournament = 3,
}

// Match category names
export const MATCH_CATEGORY_NAMES: Record<number, string> = {
  [MatchCategory.Competitive]: "Competitive",
  [MatchCategory.Custom]: "Custom",
  [MatchCategory.Tournament]: "Tournament",
};

// Win score enum
export enum WinScore {
  ElevenPoints = 1,
  FifteenPoints = 2,
  TwentyOnePoints = 3,
}
