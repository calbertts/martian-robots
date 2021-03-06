const expect                 = require('chai').expect;
const { once, EventEmitter } = require('events');
const Mars                   = require('../src/core/mars');
const events                 = require('../src/core/events');

describe('Mars Tests Suite', () => {
  const messenger = new EventEmitter();
  const mars = new Mars({w: 3, h: 5, messenger});

  it('should fail mars creation because of bad syntax', () => {
    expect(() => {
      new Mars({w: 'a', x: 'b'}, messenger);
    }).to.throw();

    expect(() => {
      new Mars({w: -1, x: 0}, messenger);
    }).to.throw();
  });

  it ('should try movement without lose it', async () => {
    process.nextTick(() => {
      mars.tryMove({x: 1, y: 0});
    });
    
    const [{shouldLost, shouldSkip}] = await once(messenger, events.MOVE_FEEDBACK);

    expect(shouldLost).to.be.false;
    expect(shouldSkip).to.be.false;
  });

  it('should try movement out of the edge (X) without a scent', async () => {
    process.nextTick(() => {
      mars.tryMove({x: 4, y: 5});
    });
    
    const [{shouldLost, shouldSkip}] = await once(messenger, events.MOVE_FEEDBACK);

    expect(shouldLost).to.be.true;
    expect(shouldSkip).to.be.false;
  });

  it('should try movement out of the edge (Y) without a scent', async () => {
    process.nextTick(() => {
      mars.tryMove({x: 3, y: 6});
    });
    
    const [{shouldLost, shouldSkip}] = await once(messenger, events.MOVE_FEEDBACK);

    expect(shouldLost).to.be.true;
    expect(shouldSkip).to.be.false;
  });

  it('should try movement out of the edge with a scent', async () => {
    process.nextTick(() => {
      mars.lostRobot({x: 3, y: 6});
      mars.tryMove({x: 3, y: 6});
    });
    
    const [{shouldLost, shouldSkip}] = await once(messenger, 'MOVE_FEEDBACK');

    expect(shouldLost).to.be.false;
    expect(shouldSkip).to.be.true;
  });
});

