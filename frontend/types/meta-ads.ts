export enum ActivityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface MetaAdAccount {
  id: string;
  name: string;
  email: string;
  access_token: string;
  status: ActivityStatus;
}
