export interface ParkCommentInput {
  parkId: string;
  body: string;
}

export interface ParkCommentDto {
  id: string;
  parkId: string;
  userId: string;
  displayName: string;
  body: string;
  createdAt: string;
}
