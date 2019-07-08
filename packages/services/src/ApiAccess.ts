import {AddressListener} from "./AddressListener";
import {BlockchainClient, emeraldCredentials, MarketClient} from "@emeraldplatform/grpc";
import {ChannelCredentials} from "grpc";
import {ChainListener} from "./ChainListener";
import {TxListener} from "./TxListener";
import {PriceListener} from "./PricesListener";
import * as os from 'os';
import {app} from 'electron';


const certLocal = "-----BEGIN CERTIFICATE-----\n" +
  "MIIFmDCCA4CgAwIBAgIBATANBgkqhkiG9w0BAQsFADBsMQswCQYDVQQGEwJDSDEM\n" +
  "MAoGA1UEBxMDWnVnMRcwFQYDVQQKEw5FbWVyYWxkUGF5IERldjEaMBgGA1UECxMR\n" +
  "RW1lcmFsZFBheSBEZXYgQ0ExGjAYBgNVBAMTEWNhLmVtZXJhbGRwYXkuZGV2MB4X\n" +
  "DTE5MDYwMjAyNDAzNFoXDTIwMTIwMjAyNDAzNFowbDELMAkGA1UEBhMCQ0gxDDAK\n" +
  "BgNVBAcTA1p1ZzEXMBUGA1UEChMORW1lcmFsZFBheSBEZXYxGjAYBgNVBAsTEUVt\n" +
  "ZXJhbGRQYXkgRGV2IENBMRowGAYDVQQDExFjYS5lbWVyYWxkcGF5LmRldjCCAiIw\n" +
  "DQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAOh9hPlHxpjUt55a5sQieNrcGVhd\n" +
  "ITPvEsDV7rGiar+41sct30d3S5R+whIHQSXAtQu282NDym6RmCE367eTubzYxaOp\n" +
  "BE+iKxYOEFggnXd+JRL7Skhd/xWUyuVUqUXR87fKuxrzVwQpDELugEQ9RVR3+WWr\n" +
  "cQbinbqDte/WyDE1ebw68umAcOZOCQ7D/SzbiVY3mzLn7xgUr0Wdxu2d5lf89B1S\n" +
  "6cXmTCorVtwVNoMcLv5BRgyd4QEgvUINkXqRjdB/C9qU+IgQK9H5He8O5HrBlNkw\n" +
  "v0tLXEhrVk5SFoKLkoeJopy1bNFNUotqKG9XCKI2+l+5L8Ioibxkthm2topAcM2/\n" +
  "/wTKyh6QCrz2rerLckn3xgI4gaTDABZwxXFv+S9wVLv7wnb1yIyFZ+pBMKfvosaZ\n" +
  "UVKY5tMsUiK5AJVlzsiFKaLi1Rwm+fObD/8/zNfjxA5X/MVeLYnj38ykRSXWA4wN\n" +
  "qoGRHlcg7BCw0KJcdV51NVQwcxh9ff1ZPUjjKlmxua/cOotfBOwqV+HLrn51V70F\n" +
  "IjPKwBmMSNt6Qm5ltbu/OdzJOPGyaro8mHMz33Vt2mNveoK9fRzrNixKfwaxHuHk\n" +
  "4RPWZeUd24uZ+2InO84aATSWchIsMIeGlwsf1VghLvqo7xl5UHt4wSgldlX4XYgQ\n" +
  "rH8aWsqXtdhCdGvDAgMBAAGjRTBDMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8E\n" +
  "CDAGAQH/AgEAMB0GA1UdDgQWBBSctyWodQE+97ZiTBJf/bEh8LwujzANBgkqhkiG\n" +
  "9w0BAQsFAAOCAgEAv1fHiGVAPIXZ/nGuCNCTcWtaMgI4anz773ma/6F4DbmBxp4R\n" +
  "rHO5YywPaoONWI2DgwUcLgd0GXQf/1YPWEPPvUOFcVSYKIijf5Nv85okWX8PdWv4\n" +
  "ICEVWt9oD6nUJ/VLNFhc34oCMWSYroPag8m45SGGy+o6EI5+c/9WwVzcJqiSfQst\n" +
  "qJ9ZvC1a/8mabJ6d6NsEhHJYC1Wua1XY47VYNUzmXFG+fVhIHpYLK2bQRnm2jTRo\n" +
  "pN6oK2hqIR0Z8/JzyJEMl+bhWChL41GPuqP5iMeM1gux6WBSR3LFzhVJ9trGyvKk\n" +
  "8NOJoF6yxvs9kdSU6ZpogDumJTjwQQCqzkBY3ipQwMmrLFl26yVhTXAz7WWKjvbe\n" +
  "IUh5l/egiWa98UVMAWWJ6TBqSb2r537d633mcfL4xPn16LXBejIdyBUNrIHAKr6h\n" +
  "RzR0ZlfJN+QOxpzd+Jz5aXxQ+VBgpsjZKafiHNgEiICHj9vIR5Z0neND1IZG1qbL\n" +
  "oOk0aiq7BErxKEV7FvmQMHB251xAFkVXIrhv7ObtWqk4n5pS6/NocclwcFqhkjpu\n" +
  "2tq1OLVhNNyRpwjLygMQUt42Ok4j/L+A1uEzNOp17/Yv6gsB6m0eUuBaLN6lKrvF\n" +
  "VKI3QbdAxjkzJ3Zzas9a87SJWrbBgWCeHq0xNECt0RZOX1OfriOofLrmUbI=\n" +
  "-----END CERTIFICATE-----\n";

const certDev = "-----BEGIN CERTIFICATE-----\n" +
  "MIIFgjCCA2qgAwIBAgIBATANBgkqhkiG9w0BAQsFADBhMRswGQYDVQQKExJFbWVy\n" +
  "YWxkUGF5IFN0YWdpbmcxHjAcBgNVBAsTFUVtZXJhbGRQYXkgU3RhZ2luZyBDQTEi\n" +
  "MCAGA1UEAxMZY2Euc3RhZ2luZy5lbWVyYWxkcGF5LmRldjAeFw0xOTA2MTQyMDQ4\n" +
  "NTBaFw0yMDEyMTQyMDQ4NTBaMGExGzAZBgNVBAoTEkVtZXJhbGRQYXkgU3RhZ2lu\n" +
  "ZzEeMBwGA1UECxMVRW1lcmFsZFBheSBTdGFnaW5nIENBMSIwIAYDVQQDExljYS5z\n" +
  "dGFnaW5nLmVtZXJhbGRwYXkuZGV2MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIIC\n" +
  "CgKCAgEA0o1BoOsYa8IvrgI0KEOh8p8Erq1qLolcaikvKYW3QBTJIuHrR5Jvo3Ia\n" +
  "1cBtGlsH6lWHPHdN9udbI67J8Wlx2Af0oDlf4YA1/iBAAwzaWocMfI8TpBpYLZrs\n" +
  "uHv+UtnA0MjtbSiG3206yhVxLRJfN/857JbjAkv912JAT3yXjylXTVOFTbks7PD6\n" +
  "s1B2bOwiXbv/RY8HnOwNKgeYRzJVcZMisOJ+nSmGa5u2ah1TLCV20ivrTIyludqa\n" +
  "ssyXDFXmrHvu5Ey6J5+A3jVmY6l/9MeZO6UvNG1voqkhdT3bvgI4KRetFCAjSa/T\n" +
  "Ovakw3oAuJlYPWR9eiMhBIdNMZn1Cdna9QspK/s+atLfEZksBDBg8DWC4TFzoyM0\n" +
  "TyMkVh6hWCyQ3t7nBbHinzXOd7nNPJ3Nz3u+FYrGcb36GXSOXzKVuGiGGLvrR8Jo\n" +
  "58nFEfAsiiVMlTWPIBLInX05eFhP0vyQ375zh6+lwBJ6OqhCTS66IyjH3vTvJmC0\n" +
  "vX2o0aUgSpf2WhvIKhk6svcZFemPYnd+ZqPGgjDwymWb6gA/gHQF8AX5IXTk1YCT\n" +
  "O5LCgbt9FzYaAxwbYQB3dVPNkJfCdDXfg8UVyVkl8yPgZbxQLazpiNvUr32qVlyS\n" +
  "xM9PlaCF/GscTOk75ayrJrriv26BufR5vpDVZmRI3TcnSkieltMCAwEAAaNFMEMw\n" +
  "DgYDVR0PAQH/BAQDAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFFK/\n" +
  "lakFlLnT68blTskBrZXPjMWxMA0GCSqGSIb3DQEBCwUAA4ICAQAzbPoRndIjGYJe\n" +
  "EWTRdiNeuJ8cpeRWmbRme67mnw7JsTGFvbrRPYmPpFKKw9hzDN7ILbXLuw3eaKLR\n" +
  "jRowxqXwBqRJE1WthF/x7W1ylxGFXCm3z5NzNYJjeHsy1LjLAiDcZTngP4PJRJb+\n" +
  "UN3dfE/jO27WvPu7skvKNX8irhiTviFeErmH/GSqmKqm5SoUv+qYGAEo6y3/B/H0\n" +
  "OgssftnMv2cyO9GO7c7GIlILnelK8diLDBWFBR6l/DDP2zbW25/tJCUYMjfEUfVl\n" +
  "/AA8vb4lJ+oO2pbj24dkahlYaCcvl4Y/xrEIygg9lZ/HM69Pj3M+dXQNDoZQ+BEy\n" +
  "6/of9rB7WFevore/9cVA98jGo5iZMZNDthiQptLL5zTX7QEQ909XRk0AVylaFkY7\n" +
  "9MU6XFYavFXU3AP6Cr027kw80WEW184YhL3yVfP9ae/Z3Kc3u3gNxX9Ac/dn7cej\n" +
  "UVHcs3Px5isgUDZOvl6LlA0VJaFi4zHZMP58jb3APVg/zEyKx6uohYWcanG7oC/h\n" +
  "rUSN3Y/9MEKPAEAxopRZH4srT1SLpPXeoZqZo5am2e4ttqK/uATj+LCiOB8iK9u8\n" +
  "1BqkK3YdAvljfAp8MxEispyJlznyFFbQ0xSIxBeQhh0MjhgFYhasZ5RGSg/K44VB\n" +
  "MwdfWdNfjQ7l+DFpz+mH6s/T/RjBWg==\n" +
  "-----END CERTIFICATE-----";

export class EmeraldApiAccess {
  private readonly address: string;
  private readonly credentials: ChannelCredentials;

  public readonly blockchainClient: BlockchainClient;
  public readonly pricesClient: MarketClient;

  constructor(addr: string, cert: string, id: string) {
    this.address = addr;
    const platform = [os.platform(), os.release(), os.arch(), app.getLocale()].join('; ');
    const agent = [
      `Electron/${process.versions.electron} (${platform})`,
      `EmeraldWallet/${app.getVersion()} (+https://emeraldwallet.io)`,
      `Chrome/${process.versions.chrome}`
    ];

    this.credentials = emeraldCredentials(addr, cert, agent, id);
    this.blockchainClient = new BlockchainClient(addr, this.credentials);
    this.pricesClient = new MarketClient(addr, this.credentials);
  }

  newAddressListener(): AddressListener {
    return new AddressListener(this.blockchainClient);
  }

  newChainListener(): ChainListener {
    return new ChainListener(this.blockchainClient);
  }

  newTxListener(): TxListener {
    return new TxListener(this.blockchainClient)
  }

  newPricesListener(): PriceListener {
    return new PriceListener(this.pricesClient);
  }
}

export class EmeraldApiAccessDev extends EmeraldApiAccess {
  constructor(id: string) {
    super("35.241.3.151:443", certDev, id);
  }
}

export class EmeraldApiAccessLocal extends EmeraldApiAccess {
  constructor(id: string) {
    super("127.0.0.1:8090", certLocal, id);
  }
}