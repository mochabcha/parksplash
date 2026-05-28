export type LoveOfferingPreset = 5 | 10 | 25 | 50;

export interface LoveOfferingInput {
  amount: number;
  email: string;
  source: 'google-maps' | 'park-limit';
  parkId?: string;
}

export interface LoveOfferingDto extends LoveOfferingInput {
  id: string;
  userId?: string;
  status: 'pending' | 'paid' | 'zero-choice' | 'failed';
  checkoutUrl?: string;
  createdAt: string;
}
