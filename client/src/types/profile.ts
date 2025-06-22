export interface Profile {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;

  avatarUrl: string | null;
  coverUrl: string | null;
  addresses: [];
}
