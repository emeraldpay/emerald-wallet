import {isNonPartial} from "./types";
import {BlockchainCode} from "@emeraldwallet/core";

describe("IAddressState", () => {
  it("math partial as full when fields are filled", () => {
    expect(isNonPartial({
      blockchain: BlockchainCode.ETH,
      asset: "ETH",
      seed: {type: "id", value: "test"},
      hdpath: "m/44'"
    })).toBeTruthy()
  });

  it("do not math partial as full when fields are missing", () => {
    expect(isNonPartial({
      asset: "ETH",
      seed: {type: "id", value: "test"},
      hdpath: "m/44'"
    })).toBeFalsy();

    expect(isNonPartial({
      blockchain: BlockchainCode.ETH,
      seed: {type: "id", value: "test"},
      hdpath: "m/44'"
    })).toBeFalsy();

    expect(isNonPartial({
      blockchain: BlockchainCode.ETH,
      asset: "ETH",
      hdpath: "m/44'"
    })).toBeFalsy();

    expect(isNonPartial({
      blockchain: BlockchainCode.ETH,
      asset: "ETH",
      seed: {type: "id", value: "test"},
    })).toBeFalsy();

  });

})