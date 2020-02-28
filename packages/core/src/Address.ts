
export class EthereumAddress {
  private readonly address: string;

  constructor (address: string) {
    if (typeof address === 'undefined' || address === null || address === '') {
      throw Error('Address is empty or undefined');
    }
    if (!address.startsWith('0x')) {
      throw Error('Address doesn\'t start with');
    }
    if (!address.match('0x[0-9a-fA-F]{40}')) {
      throw Error('Address is not 20 bytes in hex');
    }
    this.address = address.toLowerCase();
  }

  public toString (): string {
    return this.address;
  }

  public getAddress (): string {
    return this.address;
  }

}

export function isValidEthAddress (address: string): boolean {
  try {
    const x = new EthereumAddress(address);
    return true;
  } catch (e) {
    return false;
  }
}
