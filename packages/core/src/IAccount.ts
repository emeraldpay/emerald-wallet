export interface IAccount {
  readonly id: string;
  readonly blockchain: any;
  hdpath?: string;
  hardware?: boolean;
  hidden?: boolean;
  balance?: any;
  name?: string;
  description?: string;
}
