export interface IAccount {
  readonly id: string;
  blockchain: any;
  hdpath?: string;
  hardware?: boolean;
  hidden?: boolean;
  balance?: any;
  name?: string;
  description?: string;
}
