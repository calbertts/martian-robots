const expect                 = require('chai').expect;
const sinon                  = require('sinon');
const { once, EventEmitter } = require('events');
const Runner                 = require('../src/runner');
const Robot                  = require('../src/robot');
const events                 = require('../src/events');

describe('Runner Tests Suite', () => {
  const messenger = new EventEmitter();
  const content = `5 3
    1 1 E
    RFRFRFRF
    3 2 N
    FRRFLLFFRRFLL
    0 3 W
    LLFFFLFLFL`;

  it('should return mars and all robot instructions', () => {
    const { mars, robotInstructionsList } = Runner.getRobotInstructions(content, messenger);

    expect(mars).to.include({ maxX: 6, maxY: 4 });
    expect(robotInstructionsList.length).to.be.equal(3);

    // Robot 1
    expect(robotInstructionsList[0][0]).to.deep.include({x: 1, y: 1});
    expect(robotInstructionsList[0][1]).to.deep.include({instructionsInfo: 'RFRFRFRF'});
    
    // Robot 2
    expect(robotInstructionsList[1][0]).to.deep.include({x: 3, y: 2});
    expect(robotInstructionsList[1][1]).to.deep.include({instructionsInfo: 'FRRFLLFFRRFLL'});

    // Robot 3
    expect(robotInstructionsList[2][0]).to.deep.include({x: 0, y: 3});
    expect(robotInstructionsList[2][1]).to.deep.include({instructionsInfo: 'LLFFFLFLFL'});
  });

  it('should run the instructions and emit the corresponding events', async () => {
    const { mars, robotInstructionsList } = Runner.getRobotInstructions(content, messenger);

    process.nextTick(() => {
      Runner.run(robotInstructionsList);
    });

    const [ possibleMovement ] = await once(messenger, events.TRY_MOVE);
    const [ movement ]         = await once(messenger, events.MOVED);
    const [ robot ]            = await once(messenger, events.MOVEMENTS_FINISHED);

    expect(possibleMovement).to.deep.equal({ x: 1, y: 1 });
    expect(movement).to.deep.equal({ x: 1, y: 1, orientation: 'S' });
    expect(robot instanceof Robot).to.be.true;
  });
});

