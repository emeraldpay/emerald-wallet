import { EthereumAddress } from './Address';

describe('EthereumAddress.isValidEthAddress', () => {
  describe('valid', () => {
    it('valid lowercase address', () => {
      expect(EthereumAddress.isValid('0x008aeeda4d805471df9b2a5b0f38a0c3bcba786b')).toBeTruthy();
    });

    it('valid uppercase address', () => {
      expect(EthereumAddress.isValid('0x008AEEDA4D805471DF9B2A5B0F38A0C3BCBA786B')).toBeTruthy();
    });

    it('valid mixed case address', () => {
      expect(EthereumAddress.isValid('0x008AeEda4D805471dF9b2A5B0f38A0C3bCBA786b')).toBeTruthy();
    });
  });

  describe('invalid', () => {
    it('invalid empty', () => {
      expect(EthereumAddress.isValid('')).toBeFalsy();
      expect(EthereumAddress.isValid(null)).toBeFalsy();
      expect(EthereumAddress.isValid(undefined)).toBeFalsy();
    });

    it('invalid without prefix', () => {
      expect(EthereumAddress.isValid('008aeeda4d805471df9b2a5b0f38a0c3bcba786b')).toBeFalsy();
    });

    it('invalid short', () => {
      expect(EthereumAddress.isValid('0x8aeeda4d805471df9b2a5b0f38a0c3bcba786b')).toBeFalsy();
    });
  });
});
