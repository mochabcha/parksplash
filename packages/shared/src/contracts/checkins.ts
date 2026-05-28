export interface ParkCheckInInput {
  parkId: string;
  note?: string;
}

export interface ParkCheckInDto {
  id: string;
  parkId: string;
  userId: string;
  displayName: string;
  note?: string;
  createdAt: string;
}

export interface ParkCheckInSummaryDto {
  totalActive: number;
  latest: ParkCheckInDto[];
}
