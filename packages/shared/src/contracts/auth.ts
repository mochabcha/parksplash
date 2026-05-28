export interface AuthUserDto {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  locationConsent: 'unknown' | 'granted' | 'denied';
  donationGateUnlocked?: boolean;
}

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}
