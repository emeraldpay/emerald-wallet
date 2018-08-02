import BigNumber from 'bignumber.js';
import { ParityTracer } from './traceCall';

describe('ParityTracer', () => {
  it('should creates call', () => {
    const tx = {
      from: '0x1',
      to: '0x2',
    };
    const tracer = new ParityTracer(tx);
    const call = tracer.buildRequest();
    expect(call.method).toBe('trace_call');
    expect(call.params[0].from).toBe(tx.from);
  });

  describe('Gas estimator', () => {
    const from = '0xTESTADDRESSFROM';
    const to = '0xTESTADDRESSTO';
    let value = '0x038d7ea4c68000';
    let gasPrice = '0x04e3b29200';

    it('estimate call', () => {
      const trace = { output: '0x',
        stateDiff: {
          '0xtestaddressto': {
            balance: { '*': { from: '0x21526d0318ec01', to: '0x24dfeba7df6c01' } },
            code: '=',
            nonce: '=',
            storage: {} },
          '0xtestaddressfrom': { balance: { '*': { from: '0x98155a85ae35a03e0', to: '0x9815089c5ee3af3e0' } },
            code: '=',
            nonce: { '*': { from: '0x1f', to: '0x20' } },
            storage: {} },
          '0xef24b72ed3164673f4837dd61692657d48d818b8': {
            balance: { '*': { from: '0x34696a249798214e0c', to: '0x34696bb5ade879de0c' } },
            code: '=',
            nonce: '=',
            storage: {} } },
        trace: [{ action: { callType: 'call', from, gas: '0x0', input: '0x', to, value },
          result: { gasUsed: '0x0', output: '0x' },
          subtraces: 0,
          traceAddress: [],
          type: 'call' }],
        vmTrace: null };
      const testData = {
        from,
        gasPrice,
        gas: '0x5208',
        to,
        value,
        data: '0x',
      };
      expect(ParityTracer.estimateGasFromTrace(testData, trace)).toEqual(new BigNumber('441000000000000'));
      expect(ParityTracer.estimateGasFromTrace(testData, trace).div(gasPrice).toString(10)).toEqual('21000');
    });
    it('estimate call with lower gas', () => {
      gasPrice = '0xc845880';
      const trace = { stateDiff: {
        '0xtestaddressfrom': { balance: { '*': { from: '0x98155a85ae35a03e0', to: '0x9815216d97617bfe0' } },
          code: '=',
          nonce: { '*': { from: '0x1f', to: '0x20' } },
          storage: {} },
        '0xdf7d7e053933b5cc24372f878c90e62dadad5d42': {
          balance: { '*': { from: '0x491a8fab8806bc7698', to: '0x491a8faf8acf383a98' } },
          code: '=',
          nonce: '=',
          storage: {} } },
      vmTrace: null };
      const testData = {
        from,
        gasPrice,
        gas: '0x5208',
        to,
        value,
        data: '0x',
      };
      expect(ParityTracer.estimateGasFromTrace(testData, trace))
        .toEqual(new BigNumber('441000000000000').div(100));
      expect(ParityTracer.estimateGasFromTrace(testData, trace).div(gasPrice).toString(10)).toEqual('21000');
    });
    it('handle null result', () => {
      const testData = {
        from,
        gasPrice,
        gas: '0x5208',
        to,
        value,
        data: '0x',
      };
      expect(ParityTracer.estimateGasFromTrace(testData, null)).toEqual(null);
    });
    it('estimate contract call', () => {
      value = '0x0';
      const trace = { output: '0x',
        stateDiff: { '0x0000000000000000000000000000000000000000': { balance: { '*': {
          from: '0x26fd2a0d6c08be2d22c', to: '0x26fd29f40784dcf222c' } },
        code: '=',
        nonce: { '*': { from: '0x0', to: '0x1' } },
        storage: {} },
        '0xtestaddressto': { balance: { '+': '0x0' },
          code: { '+': '0x' },
          nonce: { '+': '0x0' },
          storage: {} },
        '0xtestaddressfrom': { balance: { '*': { from: '0x98155a85ae35a03e0', to: '0x981541212a54653e0' } },
          code: '=',
          nonce: { '*': { from: '0x1f', to: '0x20' } } } },
        trace: [{ action: { callType: 'call',
          from: '0x0000000000000000000000000000000000000000',
          gas: '0x0',
          input: '0x12065fe0',
          to: '0x6fc11878336e049855c93da94d89837b4a391f19',
          value: '0x0' },
        result: { gasUsed: '0x0', output: '0x' },
        subtraces: 0,
        traceAddress: [],
        type: 'call' }],
        vmTrace: null };
      const testData = {
        from,
        gasPrice,
        gas: '0x5208',
        to,
        value,
        data: '0x12065fe0',
      };
      expect(ParityTracer.estimateGasFromTrace(testData, trace)).toEqual(new BigNumber(446712000000000));
    });

    it('estimateGas in case value not enough', () => {
      const tx = {
        from: '0x82428c371a9775ec58d28455df21ff85a7f902ff',
        to: '0x82428c371a9775ec58d28455df21ff85a7f902ff',
        gas: '0x5208',
        gasPrice: '0x04a817c800',
        value: '0x056bc75e2d63100000',
        data: '',
      };

      const trace = {
        output: '0x',
        stateDiff:
                {'0x82428c371a9775ec58d28455df21ff85a7f902ff':
                {balance:
                {'*':
                                {from: '0x18dab614449e000', to: '0x56bc75e2d63100000'}},
                code: '=',
                nonce: {'*': {from: '0x7', to: '0x8'}},
                storage: {}},
                '0xdf7d7e053933b5cc24372f878c90e62dadad5d42': {
                  balance: {'*': {from: '0x23e987a2917972b1bc2', to: '0x23e987ba71475f95bc2'}},
                  code: '=',
                  nonce: '=',
                  storage: {}}},
        trace: [
          {action:
                    {callType: 'call',
                      from: '0x82428c371a9775ec58d28455df21ff85a7f902ff',
                      gas: '0x0',
                      input: '0x',
                      to: '0x82428c371a9775ec58d28455df21ff85a7f902ff',
                      value: '0x56bc75e2d63100000'},
          result: {gasUsed: '0x0', output: '0x'},
          subtraces: 0,
          traceAddress: [],
          type: 'call'}],
        vmTrace: null};

      const result = ParityTracer.estimateGasFromTrace(tx, trace);
      expect(result).toBe(null);
    });

    it('estimation based on vmTrace', () => {
      const tx = {
        from: '0x123456789aaaaabbbbbbbbcccccccccccddddddd',
        gasPrice: '0x04a817c800',
        gas: '0x5d52',
        to: '0x085fb4f24031eaedbc2b611aa528f22343eb52db',
        value: '0x00',
        data: '0xa9059cbb00000000000000000000000082428c371a9775ec58d28455df21ff85a7f902ff0000000000000000000000000000000000000000000000000000000005f5e100',
      };

      const trace = {
        output: '0x',
        stateDiff: {
          '0x123456789aaaaabbbbbbbbcccccccccccddddddd': {
            balance: {
              '*': {
                from: '0xe1fa3de2644179fc0',
                to: '0xe1fa22b97c8d18fc0',
              },
            },
            code: '=',
            nonce: {'*': {from: '0xb', to: '0xc'}},
            storage: {},
          },
          '0xdf7d7e053933b5cc24372f878c90e62dadad5d42': {
            balance: {
              '*': {
                from: '0x25c4fc5535a9bdf8747',
                to: '0x25c4fc705e917259747',
              },
            },
            code: '=',
            nonce: '=',
            storage: {},
          },
        },
        trace: [{
          action: {
            callType: 'call',
            from: '0x123456789aaaaabbbbbbbbcccccccccccddddddd',
            gas: '0x37a',
            input: '0xa9059cbb00000000000000000000000082428c371a9775ec58d28455df21ff85a7f902ff0000000000000000000000000000000000000000000000000000000005f5e100',
            to: '0x085fb4f24031eaedbc2b611aa528f22343eb52db',
            value: '0x0',
          },
          error: 'Out of gas',
          subtraces: 0,
          traceAddress: [],
          type: 'call',
        }],
        vmTrace: {
          code: '0x606060405236156100a35760e060020a60003504630325c52a81146100b057806306fdde03146100bd578063095ea7b31461012257806318160ddd1461019b57806323b872dd146101a957806328b2428d146102a4578063313ce567146102f057806342d7a279146103015780634e71d92d1461031157806370a082311461036957806395d89b411461039c578063a9059cbb14610401578063dd62ed3e146104ac575b34610002576104e5610002565b34610002576104e7610329565b346100025761050d60058054604080516020601f600260001961010060018816150201909516949094049384018190048102820181019092528281529291908301828280156105de5780601f106105b3576101008083540402835291602001916105de565b346100025761057b600435602435600160a060020a03338116600081815260026020908152604080832094871680845294825280832086905580518681529051929493927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a35060015b92915050565b346100025761038a60005481565b346100025761057b600435602435604435600160a060020a03831660009081526001602052604081205482901080159061020a5750600160a060020a0380851660009081526002602090815260408083203390941683529290522054829010155b80156102165750600082115b156105e657600160a060020a03808416600081815260016020908152604080832080548801905588851680845281842080548990039055600283528184203390961684529482529182902080548790039055815186815291519293927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35060016105ea565b346100025761038a6004356024356044356064356084355b600a54600090819086106105f1578686101561060e57508486038302868511156102eb57600019878603018302015b610619565b346100025761058f60065460ff1681565b34610002576104e7600435610336565b346100025761038a60006000600060006000600061069f5b60006000600060006105a5435b6000600060006000600060006000600060006000600a600050548b101561061e5760009950899850889750879650610692565b3461000257600160a060020a03600435166000908152600160205260409020545b60408051918252519081900360200190f35b346100025761050d60078054604080516020601f600260001961010060018816150201909516949094049384018190048102820181019092528281529291908301828280156105de5780601f106105b3576101008083540402835291602001916105de565b346100025761057b600435602435600160a060020a0333166000908152600160205260408120548290108015906104385750600082115b156107d457600160a060020a03338116600081815260016020908152604080832080548890039055938716808352918490208054870190558351868152935191937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef929081900390910190a3506001610195565b346100025761038a600435602435600160a060020a03808316600090815260026020908152604080832093851683529290522054610195565b005b604080519485526020850193909352838301919091526060830152519081900360800190f35b60405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f16801561056d5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b604080519115158252519081900360200190f35b6040805160ff9092168252519081900360200190f35b935093509350935090919293565b820191906000526020600020905b8154815290600101906020018083116105c157829003601f168201915b505050505081565b5060005b9392505050565b8685111561060457506000198685030182025b9695505050505050565b506000198585030182025b610604565b600a54600954908c03965086811561000257600954600a549290910496506001870195508602019250600085111561067c57600854600019860160020a90811561000257049150600282049050838382849950995099509950610692565b8383600860005054600080905099509950995099505b5050505050509193509193565b600354939850919650945092504390106106fb5760408051848152600060208201528151600160a060020a034116927f937e78ac307af24414540aef54dada4743089db69dc270fd1702148e7211ff02928290030190a26107ca565b60008511801561070b5750601e85105b156107ca57610722846003600050544385876102bc565b9050600083111561075257600160a060020a03411660009081526001602052604081208054850190558054840190555b600081111561078257600454600160a060020a031660009081526001602052604081208054830190558054820190555b4360035560408051848152600160208201528151600160a060020a034116927f937e78ac307af24414540aef54dada4743089db69dc270fd1702148e7211ff02928290030190a25b5090949350505050565b50600061019556',
          ops: [{
            cost: 3,
            ex: {mem: null, push: ['0x60'], store: null, used: 887},
            pc: 0,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x40'], store: null, used: 884},
            pc: 2,
            sub: null,
          }, {
            cost: 12,
            ex: {
              mem: {
                data: '0x0000000000000000000000000000000000000000000000000000000000000060',
                off: 64,
              },
              push: [],
              store: null,
              used: 872,
            },
            pc: 4,
            sub: null,
          }, {
            cost: 2,
            ex: {mem: null, push: ['0x44'], store: null, used: 870},
            pc: 5,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 867},
            pc: 6,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa3'], store: null, used: 864},
            pc: 7,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 854},
            pc: 10,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xe0'], store: null, used: 851},
            pc: 11,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x2'], store: null, used: 848},
            pc: 13,
            sub: null,
          }, {
            cost: 60,
            ex: {
              mem: null,
              push: ['0x100000000000000000000000000000000000000000000000000000000'],
              store: null,
              used: 788,
            },
            pc: 15,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 785},
            pc: 16,
            sub: null,
          }, {
            cost: 3,
            ex: {
              mem: null,
              push: ['0xa9059cbb00000000000000000000000082428c371a9775ec58d28455df21ff85'],
              store: null,
              used: 782,
            },
            pc: 18,
            sub: null,
          }, {
            cost: 5,
            ex: {mem: null, push: ['0xa9059cbb'], store: null, used: 777},
            pc: 19,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x325c52a'], store: null, used: 774},
            pc: 20,
            sub: null,
          }, {
            cost: 3,
            ex: {
              mem: null,
              push: ['0xa9059cbb', '0x325c52a', '0xa9059cbb'],
              store: null,
              used: 771,
            },
            pc: 25,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 768},
            pc: 26,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xb0'], store: null, used: 765},
            pc: 27,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 755},
            pc: 30,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa9059cbb', '0xa9059cbb'], store: null, used: 752},
            pc: 31,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x6fdde03'], store: null, used: 749},
            pc: 32,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 746},
            pc: 37,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xbd'], store: null, used: 743},
            pc: 38,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 733},
            pc: 41,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa9059cbb', '0xa9059cbb'], store: null, used: 730},
            pc: 42,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x95ea7b3'], store: null, used: 727},
            pc: 43,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 724},
            pc: 48,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x122'], store: null, used: 721},
            pc: 49,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 711},
            pc: 52,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa9059cbb', '0xa9059cbb'], store: null, used: 708},
            pc: 53,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x18160ddd'], store: null, used: 705},
            pc: 54,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 702},
            pc: 59,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x19b'], store: null, used: 699},
            pc: 60,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 689},
            pc: 63,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa9059cbb', '0xa9059cbb'], store: null, used: 686},
            pc: 64,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x23b872dd'], store: null, used: 683},
            pc: 65,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 680},
            pc: 70,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x1a9'], store: null, used: 677},
            pc: 71,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 667},
            pc: 74,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa9059cbb', '0xa9059cbb'], store: null, used: 664},
            pc: 75,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x28b2428d'], store: null, used: 661},
            pc: 76,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 658},
            pc: 81,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x2a4'], store: null, used: 655},
            pc: 82,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 645},
            pc: 85,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa9059cbb', '0xa9059cbb'], store: null, used: 642},
            pc: 86,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x313ce567'], store: null, used: 639},
            pc: 87,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 636},
            pc: 92,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x2f0'], store: null, used: 633},
            pc: 93,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 623},
            pc: 96,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa9059cbb', '0xa9059cbb'], store: null, used: 620},
            pc: 97,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x42d7a279'], store: null, used: 617},
            pc: 98,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 614},
            pc: 103,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x301'], store: null, used: 611},
            pc: 104,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 601},
            pc: 107,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa9059cbb', '0xa9059cbb'], store: null, used: 598},
            pc: 108,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x4e71d92d'], store: null, used: 595},
            pc: 109,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 592},
            pc: 114,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x311'], store: null, used: 589},
            pc: 115,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 579},
            pc: 118,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa9059cbb', '0xa9059cbb'], store: null, used: 576},
            pc: 119,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x70a08231'], store: null, used: 573},
            pc: 120,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 570},
            pc: 125,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x369'], store: null, used: 567},
            pc: 126,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 557},
            pc: 129,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa9059cbb', '0xa9059cbb'], store: null, used: 554},
            pc: 130,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x95d89b41'], store: null, used: 551},
            pc: 131,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 548},
            pc: 136,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x39c'], store: null, used: 545},
            pc: 137,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 535},
            pc: 140,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa9059cbb', '0xa9059cbb'], store: null, used: 532},
            pc: 141,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa9059cbb'], store: null, used: 529},
            pc: 142,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x1'], store: null, used: 526},
            pc: 147,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x401'], store: null, used: 523},
            pc: 148,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 513},
            pc: 151,
            sub: null,
          }, {
            cost: 1,
            ex: {mem: null, push: [], store: null, used: 512},
            pc: 1025,
            sub: null,
          }, {
            cost: 2,
            ex: {mem: null, push: ['0x0'], store: null, used: 510},
            pc: 1026,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x2'], store: null, used: 507},
            pc: 1027,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 497},
            pc: 1030,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x57b'], store: null, used: 494},
            pc: 1031,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x4'], store: null, used: 491},
            pc: 1034,
            sub: null,
          }, {
            cost: 3,
            ex: {
              mem: null,
              push: ['0x82428c371a9775ec58d28455df21ff85a7f902ff'],
              store: null,
              used: 488,
            },
            pc: 1036,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x24'], store: null, used: 485},
            pc: 1037,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x5f5e100'], store: null, used: 482},
            pc: 1039,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x1'], store: null, used: 479},
            pc: 1040,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa0'], store: null, used: 476},
            pc: 1042,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x2'], store: null, used: 473},
            pc: 1044,
            sub: null,
          }, {
            cost: 60,
            ex: {
              mem: null,
              push: ['0x10000000000000000000000000000000000000000'],
              store: null,
              used: 413,
            },
            pc: 1046,
            sub: null,
          }, {
            cost: 3,
            ex: {
              mem: null,
              push: ['0xffffffffffffffffffffffffffffffffffffffff'],
              store: null,
              used: 410,
            },
            pc: 1047,
            sub: null,
          }, {
            cost: 2,
            ex: {
              mem: null,
              push: ['0x123456789aaaaabbbbbbbbcccccccccccddddddd'],
              store: null,
              used: 408,
            },
            pc: 1048,
            sub: null,
          }, {
            cost: 3,
            ex: {
              mem: null,
              push: ['0x123456789aaaaabbbbbbbbcccccccccccddddddd'],
              store: null,
              used: 405,
            },
            pc: 1049,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 402},
            pc: 1050,
            sub: null,
          }, {
            cost: 3,
            ex: {
              mem: null,
              push: ['0x0', '0x123456789aaaaabbbbbbbbcccccccccccddddddd'],
              store: null,
              used: 399,
            },
            pc: 1052,
            sub: null,
          }, {
            cost: 3,
            ex: {
              mem: null,
              push: ['0x0', '0x123456789aaaaabbbbbbbbcccccccccccddddddd', '0x0'],
              store: null,
              used: 396,
            },
            pc: 1053,
            sub: null,
          }, {
            cost: 3,
            ex: {
              mem: {
                data: '0x00000000000000000000000048ed29ed8c0000bb215fb7fa6f56d9e4b3d89eb2',
                off: 0,
              },
              push: [],
              store: null,
              used: 393,
            },
            pc: 1054,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x1'], store: null, used: 390},
            pc: 1055,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x20'], store: null, used: 387},
            pc: 1057,
            sub: null,
          }, {
            cost: 3,
            ex: {
              mem: {
                data: '0x0000000000000000000000000000000000000000000000000000000000000001',
                off: 32,
              },
              push: [],
              store: null,
              used: 384,
            },
            pc: 1059,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x40'], store: null, used: 381},
            pc: 1060,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0', '0x40', '0x0'], store: null, used: 378},
            pc: 1062,
            sub: null,
          }, {
            cost: 42,
            ex: {
              mem: null,
              push: ['0xf6a57403440a363c77b2fa62b81f6455b8cc3ea912b56c1720f9f5baacd7179a'],
              store: null,
              used: 336,
            },
            pc: 1063,
            sub: null,
          }, {
            cost: 200,
            ex: {mem: null, push: ['0xc4e0f9008'], store: null, used: 136},
            pc: 1064,
            sub: null,
          }, {
            cost: 3,
            ex: {
              mem: null,
              push: ['0x5f5e100', '0x0', '0xc4e0f9008', '0x5f5e100'],
              store: null,
              used: 133,
            },
            pc: 1065,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x5f5e100', '0xc4e0f9008'], store: null, used: 130},
            pc: 1066,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 127},
            pc: 1067,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0', '0x0'], store: null, used: 124},
            pc: 1068,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x1'], store: null, used: 121},
            pc: 1069,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x1', '0x0'], store: null, used: 118},
            pc: 1070,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x438'], store: null, used: 115},
            pc: 1071,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 105},
            pc: 1074,
            sub: null,
          }, {
            cost: 2,
            ex: {mem: null, push: [], store: null, used: 103},
            pc: 1075,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 100},
            pc: 1076,
            sub: null,
          }, {
            cost: 3,
            ex: {
              mem: null,
              push: ['0x5f5e100', '0x0', '0x0', '0x5f5e100'],
              store: null,
              used: 97,
            },
            pc: 1078,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x1'], store: null, used: 94},
            pc: 1079,
            sub: null,
          }, {
            cost: 1,
            ex: {mem: null, push: [], store: null, used: 93},
            pc: 1080,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x0'], store: null, used: 90},
            pc: 1081,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x7d4'], store: null, used: 87},
            pc: 1082,
            sub: null,
          }, {
            cost: 10,
            ex: {mem: null, push: [], store: null, used: 77},
            pc: 1085,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x1'], store: null, used: 74},
            pc: 1086,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0xa0'], store: null, used: 71},
            pc: 1088,
            sub: null,
          }, {
            cost: 3,
            ex: {mem: null, push: ['0x2'], store: null, used: 68},
            pc: 1090,
            sub: null,
          }, {
            cost: 60,
            ex: {
              mem: null,
              push: ['0x10000000000000000000000000000000000000000'],
              store: null,
              used: 8,
            },
            pc: 1092,
            sub: null,
          }, {
            cost: 3,
            ex: {
              mem: null,
              push: ['0xffffffffffffffffffffffffffffffffffffffff'],
              store: null,
              used: 5,
            },
            pc: 1093,
            sub: null,
          }, {
            cost: 2,
            ex: {
              mem: null,
              push: ['0x123456789aaaaabbbbbbbbcccccccccccddddddd'],
              store: null,
              used: 3,
            },
            pc: 1094,
            sub: null,
          }, {
            cost: 3,
            ex: {
              mem: null,
              push: ['0xffffffffffffffffffffffffffffffffffffffff', '0x123456789aaaaabbbbbbbbcccccccccccddddddd', '0xffffffffffffffffffffffffffffffffffffffff'],
              store: null,
              used: 0,
            },
            pc: 1095,
            sub: null,
          }, {cost: 3, ex: null, pc: 1096, sub: null}],
        },
      };

      const result = ParityTracer.estimateGasFromTrace(tx, trace);
    });
  });
});
