const expect       = require('chai').expect;
const sinon        = require('sinon');
const Instructions = require('../src/core/instructions');

describe('Instructions Tests Suite', () => {
  it('should fail instruction creation because of bad syntax', () => {
    expect(() => {
      new Instructions('LRFALRF');
    }).to.throw();

    expect(() => {
      new Instructions('LRF'.padStart(101, "LRF"));
    }).to.throw();
  });

  it('should generate all movements', async () => {
    const instructions = new Instructions('RFL');

    const movements = instructions.getMovements('N');
    
    expect(movements).to.deep.equal([
      { o: 'E', x: 0, y: 0, command: 'R' },
      { o: 'E', x: 1, y: 0, command: 'F' },
      { o: 'N', x: 0, y: 0, command: 'L' },
    ]);
  });
});

