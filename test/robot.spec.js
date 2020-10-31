const expect                 = require('chai').expect
const sinon                  = require('sinon');
const { once, EventEmitter } = require('events');
const Robot                  = require('../src/robot');
const events                 = require('../src/events')

describe('Robot Tests Suite', () => {
  const messenger = new EventEmitter();

  it('should fail robot creation because of bad syntax', () => {
    expect(() => {
      new Robot('a b 3', messenger);
    }).to.throw();

    expect(() => {
      new Robot('1 1 X', messenger);
    }).to.throw();

    expect(() => {
      new Robot('51 1 S', messenger);
    }).to.throw();
  })

  it('should give movement feedback', async () => {
    const robot = new Robot('1 1 E', messenger);

    process.nextTick(() => {
      robot._canIMove({x: 1, y: 0});
    });

    messenger.on(events.TRY_MOVE, (possibleMovement) => {
      messenger.emit(events.MOVE_FEEDBACK, {shouldLost: false, shouldSkip: false});
    });

    const [{shouldLost, shouldSkip}] = await once(messenger, events.MOVE_FEEDBACK);

    expect(shouldLost).to.be.false;
    expect(shouldSkip).to.be.false;
  });

  it('should register a scent', async () => {
    const robot = new Robot('3 3 E', messenger);

    process.nextTick(() => {
      robot.lost({x: 3, y: 4});
    });

    const [scent] = await once(messenger, events.IM_LOST);

    expect(scent).to.deep.equal({x: 3, y: 4});
    expect(robot.toString()).to.be.equal('3 3 E LOST');
  });

  it('should report its info', async () => {
    const robot = new Robot('3 1 E', messenger);
    expect(robot.toString()).to.be.equal('3 1 E');
  });

  context('movements', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should pass with no movements', async () => {
      const robot = new Robot('3 1 E', messenger);
      const instructions = {
        getMovements: sinon.fake.returns([])
      };

      robot.move(instructions);

      expect(robot.toString()).to.be.equal('3 1 E');
    });

    it('should perform a valid rotation', async () => {
      const robot = new Robot('3 1 E', messenger);

      const instructions = {
        getMovements: sinon.fake.returns([
          { o: 'S', x: 0, y: 0, command: 'R' },
        ])
      };
      sinon.replace(robot, '_canIMove', sinon.fake.returns([
        {shouldLost: false, shouldSkip: false}
      ]));

      await robot.move(instructions);

      expect(instructions.getMovements.called).to.be.true;
      expect(robot._canIMove.called).to.be.true;
      expect(robot.toString()).to.be.equal('3 1 S');
    });

    it('should perform a valid movement', async () => {
      const robot = new Robot('3 1 E', messenger);

      const instructions = {
        getMovements: sinon.fake.returns([
          { o: 'E', x: 1, y: 0, command: 'F' },
        ])
      };
      sinon.replace(robot, '_canIMove', sinon.fake.returns([
        {shouldLost: false, shouldSkip: false}
      ]));

      await robot.move(instructions);

      expect(instructions.getMovements.called).to.be.true;
      expect(robot._canIMove.called).to.be.true;
      expect(robot.toString()).to.be.equal('4 1 E');
    });

    it('should perform a lost', async () => {
      const robot = new Robot('3 1 E', messenger);

      const instructions = {
        getMovements: sinon.fake.returns([
          { o: 'E', x: 1, y: 0, command: 'F' },
          { o: 'S', x: 0, y: 0, command: 'R' },
        ])
      };
      sinon.replace(robot, '_canIMove', sinon.fake.returns([
        {shouldLost: true, shouldSkip: false}
      ]));

      await robot.move(instructions);

      expect(instructions.getMovements.called).to.be.true;
      expect(robot._canIMove.calledOnce).to.be.true;
      expect(robot.x).to.be.equal(4);
      expect(robot.y).to.be.equal(1);
      expect(robot.toString()).to.be.equal('3 1 E LOST');
    });

    it('should perform a skip', async () => {
      const robot = new Robot('3 1 E', messenger);

      const instructions = {
        getMovements: sinon.fake.returns([
          { o: 'E', x: 1, y: 0, command: 'F' },
          { o: 'E', x: 1, y: 0, command: 'F' },
        ])
      };
      sinon.replace(robot, '_canIMove', sinon.fake.returns([
        {shouldLost: false, shouldSkip: true}
      ]));

      await robot.move(instructions);

      expect(instructions.getMovements.called).to.be.true;
      expect(robot._canIMove.calledTwice).to.be.true;
      expect(robot.x).to.be.equal(3);
      expect(robot.y).to.be.equal(1);
      expect(robot.toString()).to.be.equal('3 1 E');
    });
  })
});

