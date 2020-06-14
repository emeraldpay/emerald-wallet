import {CreateWalletFlow, STEP_CODE} from "./createWalletFlow";
import {BlockchainCode} from "@emeraldwallet/core";
import {defaultResult, Result} from "./types";

const noCreate = () => {
};

describe("Select Source Type", () => {

  it("when empty selected", () => {
    const start = new CreateWalletFlow(noCreate);
    expect(start.canGoNext()).toBeFalsy();
    const act = start
      .applySource("empty");

    expect(act.getCurrentStep().code).toBe(STEP_CODE.OPTIONS);
    expect(act.getCurrentStep().index).toBe(1);

    expect(act.getSteps().length).toBe(3);
    expect(act.getSteps()[0].code).toBe(STEP_CODE.KEY_SOURCE);
    expect(act.getSteps()[1].code).toBe(STEP_CODE.OPTIONS);
    expect(act.getSteps()[2].code).toBe(STEP_CODE.CREATED);
  });

  it("when seed selected", () => {
    const start = new CreateWalletFlow(noCreate);
    const act = start
      .applySource({id: "test"});

    expect(act.getCurrentStep().code).toBe(STEP_CODE.OPTIONS);
    expect(act.getCurrentStep().index).toBe(1);

    expect(act.getSteps().length).toBe(6);
    expect(act.getSteps()[0].code).toBe(STEP_CODE.KEY_SOURCE);
    expect(act.getSteps()[1].code).toBe(STEP_CODE.OPTIONS);
    expect(act.getSteps()[2].code).toBe(STEP_CODE.SELECT_BLOCKCHAIN);
    expect(act.getSteps()[3].code).toBe(STEP_CODE.UNLOCK_SEED);
    expect(act.getSteps()[4].code).toBe(STEP_CODE.SELECT_HD_ACCOUNT);
    expect(act.getSteps()[5].code).toBe(STEP_CODE.CREATED);
  });

});

describe("Select Options", () => {
  it("empty label", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {id: "test"}
    }
    const start = CreateWalletFlow.create(initial, STEP_CODE.OPTIONS, noCreate);
    const act = start
      .applyOptions({label: ""})
      .applyNext();

    expect(act.getCurrentStep().code).toBe(STEP_CODE.SELECT_BLOCKCHAIN);
    expect(act.getCurrentStep().index).toBe(2);
    expect(act.getSteps().length).toBe(6);
  });

  it("some label", () => {
    const start = new CreateWalletFlow(noCreate)
      .applySource({id: "test"});
    const act = start
      .applyOptions({label: "some label"})
      .applyNext();

    expect(act.getCurrentStep().code).toBe(STEP_CODE.SELECT_BLOCKCHAIN);
    expect(act.getCurrentStep().index).toBe(2);
    expect(act.getResult().options.label).toBe("some label");
    expect(act.getSteps().length).toBe(6);
  });

  it("creates if empty source", () => {
    const initial: Result = {
      ...defaultResult(),
      type: 'empty'
    }
    let result: Result | undefined = undefined;
    const start = CreateWalletFlow.create(initial, STEP_CODE.OPTIONS, (it) => result = it);
    const act = start
      .applyOptions({label: "test"})
      .applyNext();
    expect(result).toBeDefined();
    expect(result!.type).toBe("empty");
    expect(act.getCurrentStep().code).toBe(STEP_CODE.CREATED)
  });
});

describe("Select Blockchain", () => {
  it("goes to unlock", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {id: "test"}
    }
    const start = CreateWalletFlow.create(initial, STEP_CODE.SELECT_BLOCKCHAIN, noCreate);
    expect(start.canGoNext()).toBeFalsy();
    let act = start
      .applyBlockchains([BlockchainCode.ETH]);
    expect(act.canGoNext()).toBeTruthy();
    act = act.applyNext();
    expect(act.getCurrentStep().code).toBe(STEP_CODE.UNLOCK_SEED);
  });
});


describe("Unlock Seed", () => {
  it("unlocked with password", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {id: "test"}
    }
    const start = CreateWalletFlow.create(initial, STEP_CODE.UNLOCK_SEED, noCreate);
    expect(start.canGoNext()).toBeFalsy();
    const act = start
      .applySeedPassword("test");
    expect(act.getCurrentStep().code).toBe(STEP_CODE.SELECT_HD_ACCOUNT);
  });
});

describe("Account", () => {
  it("creates after selection", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {id: "test"},
      seedPassword: "test",
      blockchains: [BlockchainCode.ETH]
    }
    let result: Result | undefined = undefined;
    const start = CreateWalletFlow.create(initial, STEP_CODE.SELECT_HD_ACCOUNT, (it) => result = it);
    expect(start.canGoNext()).toBeFalsy();
    let act = start
      .applyHDAccount(1);
    expect(act.canGoNext()).toBeTruthy();
    act = act.applyNext();
    expect(act.getCurrentStep().code).toBe(STEP_CODE.CREATED)
    expect(result).toBeDefined();
    expect(result!.seedAccount).toBe(1);
  });
});
