import {CreateWalletFlow, STEP_CODE} from "./createWalletFlow";
import {BlockchainCode} from "@emeraldwallet/core";
import {defaultResult, KeySourceType, PkImportJson, Result} from "./types";

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
      .applySource({type: KeySourceType.SEED_SELECTED, id: "test"});

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
      type: {type: KeySourceType.SEED_SELECTED, id: "test"}
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
      .applySource({type: KeySourceType.SEED_SELECTED, id: "test"});
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

  it("goes to import key", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {
        type: KeySourceType.PK_ANY
      }
    }
    const start = CreateWalletFlow.create(initial, STEP_CODE.OPTIONS, noCreate);
    const act = start
      .applyOptions({label: "test"})
      .applyNext();
    expect(act.getCurrentStep().code).toBe(STEP_CODE.PK_IMPORT)
  });
});

describe("Generate Mnemonic", () => {
  it("goes to lock", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {type: KeySourceType.SEED_GENERATE}
    }
    const start = CreateWalletFlow.create(initial, STEP_CODE.MNEMONIC_GENERATE, noCreate);
    expect(start.canGoNext()).toBeFalsy();
    let act = start
      .applyMnemonic("test test test", undefined);
    expect(act.getMnemonic()).toEqual({
      type: KeySourceType.SEED_GENERATE,
      mnemonic: "test test test",
      password: undefined
    });
    expect(act.getCurrentStep().code).toBe(STEP_CODE.LOCK_SEED);
  });
});

describe("Import PK", () => {
  it("json is set", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {
        type: KeySourceType.PK_ANY
      }
    }
    const start = CreateWalletFlow.create(initial, STEP_CODE.PK_IMPORT, noCreate);
    const act = start.applyImportPk("{}");
    expect(act.canGoNext()).toBeTruthy();
    expect(act.getResult().type).toEqual({type: KeySourceType.PK_WEB3_JSON, json: "{}"});
  });

  it("json is unset", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {
        type: KeySourceType.PK_ANY
      }
    }
    const start = CreateWalletFlow.create(initial, STEP_CODE.PK_IMPORT, noCreate);
    const act = start
      .applyImportPk("{}")
      .applyImportPk(undefined);
    expect(act.canGoNext()).toBeFalsy();
    expect(act.getResult().type).toEqual({type: KeySourceType.PK_ANY});
  });

  it("raw is set", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {
        type: KeySourceType.PK_ANY
      }
    }
    const start = CreateWalletFlow.create(initial, STEP_CODE.PK_IMPORT, noCreate);
    const act = start.applyImportPk({raw: "0x00", password: "test"});
    expect(act.canGoNext()).toBeTruthy();
    expect(act.getResult().type).toEqual({type: KeySourceType.PK_RAW, pk: "0x00", password: "test"});
  });

  it("raw is unset", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {
        type: KeySourceType.PK_ANY
      }
    }
    const start = CreateWalletFlow.create(initial, STEP_CODE.PK_IMPORT, noCreate);
    const act = start
      .applyImportPk({raw: "0x00", password: "test"})
      .applyImportPk(undefined);
    expect(act.canGoNext()).toBeFalsy();
    expect(act.getResult().type).toEqual({type: KeySourceType.PK_ANY});
  });
});

describe("Import Mnemonic", () => {
  it("goes to lock", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {type: KeySourceType.SEED_IMPORT}
    }
    const start = CreateWalletFlow.create(initial, STEP_CODE.MNEMONIC_IMPORT, noCreate);
    expect(start.canGoNext()).toBeFalsy();
    let act = start
      .applyMnemonic("test test test", "test");
    expect(act.getMnemonic()).toEqual({
      type: KeySourceType.SEED_IMPORT,
      mnemonic: "test test test",
      password: "test"
    });
    expect(act.getCurrentStep().code).toBe(STEP_CODE.LOCK_SEED);
  });
});

describe("Lock seed", () => {
  it("goes to blockchains", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {type: KeySourceType.SEED_GENERATE, mnemonic: "test test test"},
    }
    const start = CreateWalletFlow.create(initial, STEP_CODE.LOCK_SEED, noCreate);
    expect(start.canGoNext()).toBeFalsy();
    let act = start
      .applyMnemonicSaved("test-uuid", "testpwd");
    expect(act.getResult().seed).toEqual({
      type: "id", value: "test-uuid", password: "testpwd"
    });
    expect(act.getCurrentStep().code).toBe(STEP_CODE.SELECT_BLOCKCHAIN);
  });
});

describe("Select Blockchain", () => {
  it("goes to unlock", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {type: KeySourceType.SEED_SELECTED, id: "test"}
    }
    const start = CreateWalletFlow.create(initial, STEP_CODE.SELECT_BLOCKCHAIN, noCreate);
    expect(start.canGoNext()).toBeFalsy();
    let act = start
      .applyBlockchains([BlockchainCode.ETH]);
    expect(act.canGoNext()).toBeTruthy();
    act = act.applyNext();
    expect(act.getCurrentStep().code).toBe(STEP_CODE.UNLOCK_SEED);
  });

  it("goes to account if knows password", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {type: KeySourceType.SEED_GENERATE},
      seed: {type: "id", value: "test-uuid", password: "testpwd"}
    }
    const start = CreateWalletFlow.create(initial, STEP_CODE.SELECT_BLOCKCHAIN, noCreate);
    expect(start.canGoNext()).toBeFalsy();
    let act = start
      .applyBlockchains([BlockchainCode.ETH]);
    expect(act.canGoNext()).toBeTruthy();
    act = act.applyNext();
    expect(act.getCurrentStep().code).toBe(STEP_CODE.SELECT_HD_ACCOUNT);
  });

  it("create if import pk", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {type: KeySourceType.PK_WEB3_JSON, json: "{}"},
    }
    let result: Result | undefined = undefined;
    const start = CreateWalletFlow.create(initial, STEP_CODE.SELECT_BLOCKCHAIN, (it) => result = it);
    expect(start.canGoNext()).toBeFalsy();
    let act = start
      .applyBlockchains([BlockchainCode.ETH]);
    expect(act.canGoNext()).toBeTruthy();
    act = act.applyNext();
    expect(act.getCurrentStep().code).toBe(STEP_CODE.CREATED);
    expect(result).toBeDefined();
  })

});


describe("Unlock Seed", () => {
  it("unlocked with password", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {type: KeySourceType.SEED_SELECTED, id: "test"}
    }
    const start = CreateWalletFlow.create(initial, STEP_CODE.UNLOCK_SEED, noCreate);
    expect(start.canGoNext()).toBeFalsy();
    const act = start
      .applySeedPassword("testpwd");
    expect(act.getCurrentStep().code).toBe(STEP_CODE.SELECT_HD_ACCOUNT);
    expect(act.getResult().seed).toEqual({type: "id", value: "test", password: "testpwd"})
  });
});

describe("Account", () => {
  it("creates after selection", () => {
    const initial: Result = {
      ...defaultResult(),
      type: {type: KeySourceType.SEED_SELECTED, id: "test"},
      seed: {type: "id", password: "test", value: "test"},
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
