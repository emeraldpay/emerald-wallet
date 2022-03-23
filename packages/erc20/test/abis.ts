const abi1 = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "newAddr",
        "type": "address"
      }
    ],
    "name": "setFoundationWallet",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalUnrestrictedAssignments",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getState",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "round0StartTime",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "round0Target",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "minDonation",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "weiDonated",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "x",
        "type": "uint256"
      },
      {
        "name": "a",
        "type": "uint256"
      },
      {
        "name": "b",
        "type": "uint256"
      }
    ],
    "name": "multFracCeiling",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalRestrictedTokens",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "round1BonusSteps",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "newAuth",
        "type": "address"
      }
    ],
    "name": "setExchangeRateAuth",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "round1StartTime",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "round1EndTime",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "maxRoundDelay",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "n",
        "type": "uint256"
      }
    ],
    "name": "getPhaseStartTime",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "time",
        "type": "uint256"
      }
    ],
    "name": "getMultiplierAtTime",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "targetReached",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "finalize",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "assignmentsClosed",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "donorList",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "phaseLength",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "addr",
        "type": "address"
      },
      {
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "name": "chfCents",
        "type": "uint256"
      },
      {
        "name": "currency",
        "type": "string"
      },
      {
        "name": "memo",
        "type": "bytes32"
      }
    ],
    "name": "registerOffChainDonation",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "gracePeriodAfterRound1Target",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalRestrictedAssignments",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "burnMultNom",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "foundationWallet",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "gracePeriodAfterRound0Target",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "finalizeStartTime",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "finalizeEndTime",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "donationRound",
        "type": "uint256"
      },
      {
        "name": "dfnAddr",
        "type": "address"
      },
      {
        "name": "fwdAddr",
        "type": "address"
      }
    ],
    "name": "getStatus",
    "outputs": [
      {
        "name": "currentState",
        "type": "uint8"
      },
      {
        "name": "fxRate",
        "type": "uint256"
      },
      {
        "name": "currentMultiplier",
        "type": "uint256"
      },
      {
        "name": "donationCount",
        "type": "uint256"
      },
      {
        "name": "totalTokenAmount",
        "type": "uint256"
      },
      {
        "name": "startTime",
        "type": "uint256"
      },
      {
        "name": "endTime",
        "type": "uint256"
      },
      {
        "name": "isTargetReached",
        "type": "bool"
      },
      {
        "name": "chfCentsDonated",
        "type": "uint256"
      },
      {
        "name": "tokenAmount",
        "type": "uint256"
      },
      {
        "name": "fwdBalance",
        "type": "uint256"
      },
      {
        "name": "donated",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "burnMultDen",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "donPhase",
        "type": "uint256"
      },
      {
        "name": "timedelta",
        "type": "uint256"
      }
    ],
    "name": "delayDonPhase",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "round1Target",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "earlyContribList",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "round0EndTime",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "isUnrestricted",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "restrictions",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "earlyContribShare",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "target",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "newAuth",
        "type": "address"
      }
    ],
    "name": "setRegistrarAuth",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalUnrestrictedTokens",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "weiPerCHF",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "elapsedTime",
        "type": "uint256"
      }
    ],
    "name": "getStepFunction",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "exchangeRateAuth",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "counter",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "masterAuth",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "time",
        "type": "uint256"
      },
      {
        "name": "n",
        "type": "uint256"
      }
    ],
    "name": "isPhase",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "registrarAuth",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "restrictedShare",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "tokensPerCHF",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "round1InitialBonus",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "weis",
        "type": "uint256"
      }
    ],
    "name": "setWeiPerCHF",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "N",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "addr",
        "type": "address"
      },
      {
        "name": "checksum",
        "type": "bytes4"
      }
    ],
    "name": "donateAsWithChecksum",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": true,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "phaseEndTime",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "addr",
        "type": "address"
      },
      {
        "name": "restricted",
        "type": "bool"
      }
    ],
    "name": "isRegistered",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "maxDelay",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "newAuth",
        "type": "address"
      }
    ],
    "name": "setMasterAuth",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "step",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "tokens",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "time",
        "type": "uint256"
      }
    ],
    "name": "getPhaseAtTime",
    "outputs": [
      {
        "name": "n",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "round0Bonus",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "empty",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "nSteps",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "addr",
        "type": "address"
      },
      {
        "name": "tokenAmount",
        "type": "uint256"
      },
      {
        "name": "memo",
        "type": "bytes32"
      }
    ],
    "name": "registerEarlyContrib",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalWeiDonated",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "millionInCents",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "_masterAuth",
        "type": "address"
      },
      {
        "name": "_name",
        "type": "string"
      }
    ],
    "payable": false,
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "addr",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "currency",
        "type": "string"
      },
      {
        "indexed": true,
        "name": "bonusMultiplierApplied",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "tokenAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "memo",
        "type": "bytes32"
      }
    ],
    "name": "DonationReceipt",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "addr",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "tokenAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "memo",
        "type": "bytes32"
      }
    ],
    "name": "EarlyContribReceipt",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "addr",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "tokenAmountBurned",
        "type": "uint256"
      }
    ],
    "name": "BurnReceipt",
    "type": "event"
  }
]

const abi2 = [{
  "constant": true,
  "inputs": [],
  "name": "name",
  "outputs": [{"name": "name", "type": "string"}],
  "payable": false,
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"name": "_spender", "type": "address"}, {"name": "_allowance", "type": "uint256"}],
  "name": "approve",
  "outputs": [{"name": "success", "type": "bool"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "totalSupply",
  "outputs": [{"name": "totalSupply", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {
    "name": "_value",
    "type": "uint256"
  }],
  "name": "transferFrom",
  "outputs": [{"name": "success", "type": "bool"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [{"name": "", "type": "address"}],
  "name": "balances",
  "outputs": [{"name": "", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "decimals",
  "outputs": [{"name": "decimals", "type": "uint8"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "_decimals",
  "outputs": [{"name": "", "type": "uint8"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "amountBurned",
  "outputs": [{"name": "amountBurned", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [{"name": "", "type": "address"}, {"name": "", "type": "address"}],
  "name": "allowed",
  "outputs": [{"name": "", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [{"name": "_address", "type": "address"}],
  "name": "balanceOf",
  "outputs": [{"name": "balance", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "currentSupply",
  "outputs": [{"name": "currentSupply", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "owner",
  "outputs": [{"name": "", "type": "address"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "symbol",
  "outputs": [{"name": "symbol", "type": "string"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "_currentSupply",
  "outputs": [{"name": "", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
  "name": "transfer",
  "outputs": [{"name": "success", "type": "bool"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "_symbol",
  "outputs": [{"name": "", "type": "string"}],
  "payable": false,
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}, {
    "name": "_data",
    "type": "bytes"
  }],
  "name": "transfer",
  "outputs": [{"name": "success", "type": "bool"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "_initialSupply",
  "outputs": [{"name": "", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "_name",
  "outputs": [{"name": "", "type": "string"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
  "name": "allowance",
  "outputs": [{"name": "remaining", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"name": "_value", "type": "uint256"}, {"name": "_data", "type": "bytes"}],
  "name": "burn",
  "outputs": [{"name": "success", "type": "bool"}],
  "payable": false,
  "type": "function"
}, {"inputs": [], "payable": false, "type": "constructor"}, {"payable": false, "type": "fallback"}, {
  "anonymous": false,
  "inputs": [{"indexed": true, "name": "from", "type": "address"}, {
    "indexed": true,
    "name": "to",
    "type": "address"
  }, {"indexed": false, "name": "value", "type": "uint256"}],
  "name": "Transfer",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": true, "name": "from", "type": "address"}, {
    "indexed": true,
    "name": "to",
    "type": "address"
  }, {"indexed": false, "name": "value", "type": "uint256"}],
  "name": "Approval",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": true, "name": "from", "type": "address"}, {
    "indexed": false,
    "name": "amount",
    "type": "uint256"
  }, {"indexed": false, "name": "currentSupply", "type": "uint256"}, {
    "indexed": false,
    "name": "data",
    "type": "bytes"
  }],
  "name": "Burn",
  "type": "event"
}];

export {abi1, abi2}
