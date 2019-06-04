import {AddressListener} from "./AddressListener";
import {BlockchainClient, emeraldCredentials, MarketClient} from "@emeraldplatform/grpc";
import {ChannelCredentials} from "grpc";
import {ChainListener} from "./ChainListener";
import {TxListener} from "./TxListener";
import {PriceListener} from "./PricesListener";

const certDevelopment = Buffer.from("-----BEGIN CERTIFICATE-----\n" +
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
  "-----END CERTIFICATE-----\n", "utf8");

export class EmeraldApiAccess {
  private readonly address: string;
  private readonly credentials: ChannelCredentials;

  public readonly blockchainClient: BlockchainClient;
  public readonly pricesClient: MarketClient;

  constructor(addr: string, cert: Buffer) {
    this.address = addr;
    this.credentials = emeraldCredentials(addr, cert);
    this.blockchainClient = new BlockchainClient(addr, this.credentials);
    this.pricesClient = new MarketClient(addr, this.credentials);
  }

  newAddressListener(chain: string): AddressListener {
    return new AddressListener(chain, this.blockchainClient);
  }

  newChainListener(chain: string): ChainListener {
    return new ChainListener(chain, this.blockchainClient);
  }

  newTxListener(chain: string): TxListener {
    return new TxListener(chain, this.blockchainClient)
  }

  newPricesListener(): PriceListener {
    return new PriceListener(this.pricesClient);
  }
}

export class EmeraldApiAccessDev extends EmeraldApiAccess {

  constructor() {
    super("127.0.0.1:8090", certDevelopment);
  }
}