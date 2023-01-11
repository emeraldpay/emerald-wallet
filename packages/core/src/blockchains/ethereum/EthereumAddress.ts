export class EthereumAddress {
  private readonly address: string;

  constructor(address: string) {
    if (address == null || address === '') {
      throw new Error('Address is empty or undefined');
    }

    if (!address.startsWith('0x')) {
      throw new Error("Address doesn't start with");
    }

    if (!address.match('0x[0-9a-fA-F]{40}')) {
      throw new Error('Address is not 20 bytes in hex');
    }

    this.address = address.toLowerCase();
  }

  static isValid(address: string): boolean {
    try {
      new EthereumAddress(address);

      return true;
    } catch (exception) {
      return false;
    }
  }

  equals(another: EthereumAddress): boolean {
    return this.address.toLowerCase() === another.toString().toLowerCase();
  }

  getAddress(): string {
    return this.address;
  }

  toString(): string {
    return this.address;
  }
}
