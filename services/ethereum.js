'use strict';

const BN = require('bn.js');

const Entity = require('../types/entity');
const Service = require('../types/service');

// Ethereum
const VM = require('ethereumjs-vm').default;
const Opcodes = {
  STOP: '00',
  ADD: '01',
  PUSH1: '60'
};

class Ethereum extends Service {
  constructor (settings = {}) {
    super(settings);

    this.status = 'constructing';
    this.settings = Object.assign({
      name: '@services/ethereum'
    }, settings);

    this._state = {};
    this.vm = new VM();
    this.status = 'constructed';
  }

  async _test () {
    let program = [
      Opcodes.PUSH1,
      '03',
      Opcodes.PUSH1,
      '05',
      Opcodes.ADD, 
      Opcodes.STOP
    ];

    return this.execute(program);
  }

  async _handleVMStep (data) {
    console.log('[SERVICES:ETHEREUM]', '[VM]', `Executed Opcode: ${data.opcode.name}\n\tStack:`, data.stack);
  }

  async execute (program) {
    if (!(program instanceof Array)) throw new Error('Cannot process program unless it is an Array.');

    return this.vm.runCode({
      code: Buffer.from(program.join(''), 'hex'),
      gasLimit: new BN(0xffff),
    }).then(results => {
      console.log('Returned : ' + results.returnValue.toString('hex'));
      console.log('Gas used : ' + results.gasUsed.toString());
    }).catch(err => console.log('Error    : ' + err));
  }

  async stop () {
    this.status = 'stopping';
    // await this.vm.destroy();
    this.status = 'stopped';
  }

  async start () {
    this.status = 'starting';
    this.vm.on('step', this._handleVMStep.bind(this));
    this.status = 'started';
  }
}

module.exports = Ethereum;