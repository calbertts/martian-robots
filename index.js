const { once, EventEmitter } = require('events');
const events = require('./src/events')

class Mars {
  constructor({x, y, messenger}) {
    this.maxX = x+1;
    this.maxY = y+1;
    this.robots = [];
    this.scents = [];
    this.messenger = messenger;

    messenger.on(events.TRY_MOVE, this.tryMove.bind(this));
    messenger.on(events.IM_LOST, this.lostRobot.bind(this));
  }

  tryMove(possibleMovement) {
    let shouldSkip = false;
    let shouldLost = false;

    if (this.willBeLost(possibleMovement)) {
      if (!this.isAScent(possibleMovement)) {
        shouldLost = true;
      } else {
        shouldLost = false;
        shouldSkip = true;
      }
    }

    this.messenger.emit(events.MOVE_FEEDBACK, {shouldLost, shouldSkip});
  }

  addRobot(robot) {
    this.robots(robot);
  }

  isAScent(possibleMovement) {
    return !!this.scents.find(robotScent => 
      robotScent.x === possibleMovement.x && robotScent.y === possibleMovement.y
    );
  }

  willBeLost(possibleMovement) {
    return possibleMovement.x >= this.maxX || possibleMovement.y >= this.maxY;
  }

  lostRobot(scent) {
    this.scents.push(scent);
  }
}

class Robot {
  #messenger
  #isLost = false;

  constructor(robotInfo, messenger, id) {
    const [x, y, orientation] = robotInfo.split(' ');

    this.id          = id;
    this.x           = Number(x);
    this.y           = Number(y);
    this.orientation = orientation;
    this.#messenger  = messenger;
  }

  async move(instructions) {
    const movements = instructions.getMovements(this.orientation);
    console.log(movements)

    for (let move of movements) {
      if (this.#isLost) {
        break;
      }

      const possibleMovement = {
        x: this.x + move.x,
        y: this.y + move.y
      };

      const [{shouldLost, shouldSkip}] = await this.canIMove(possibleMovement);

      if (shouldSkip) {
        continue;
      }
      
      if (shouldLost) {
        this.lost(possibleMovement);
      }

      this.x           = possibleMovement.x;
      this.y           = possibleMovement.y;
      this.orientation = move.o;
    }
  }

  async canIMove(possibleMovement) {
    process.nextTick(() => {
      this.#messenger.emit(events.TRY_MOVE, possibleMovement);
    });
    return await once(this.#messenger, events.MOVE_FEEDBACK);
  }

  lost(possibleMovement) {
    this.lastX = this.x;
    this.lastY = this.y;
    this.#isLost = true;

    this.#messenger.emit(events.IM_LOST, possibleMovement);
  }

  toString() {
    return `${this.lastX || this.x} ${this.lastY || this.y} ${this.orientation} ${this.#isLost ? 'LOST' : ''}`;
  }
}

class Instructions {
  #instructionsInfo = ''
  #movements        = [];
  #instTable = {
    L: {
      S: {o: 'E', x: 0, y: 0},
      N: {o: 'W', x: 0, y: 0},
      W: {o: 'S', x: 0, y: 0},
      E: {o: 'N', x: 0, y: 0},
    },
    R: {
      S: {o: 'W', x: 0, y: 0},
      N: {o: 'E', x: 0, y: 0},
      W: {o: 'N', x: 0, y: 0},
      E: {o: 'S', x: 0, y: 0},
    },
    F: {
      S: {o: 'S', x: 0,  y: -1},
      N: {o: 'N', x: 0,  y: 1},
      W: {o: 'W', x: -1, y: 0},
      E: {o: 'E', x: 1,  y: 0},
    }
  }
  
  constructor(instructionsInfo) {
    this.#instructionsInfo = instructionsInfo;
    this.#movements        = instructionsInfo.split('');
  }

  getMovements(initialOrientation) {
    let o = initialOrientation;

    return this.#movements.map(move => {
      const movement = this.#instTable[move][o];
      movement.command = move;
      o = movement.o;
      return movement;
    });
  }

  toString() {
    return this.#instructionsInfo;
  }
}

(async () => {
  const messenger = new EventEmitter();

  const mars = new Mars({ x: 5, y: 3, messenger });

  const robot = new Robot('1 1 E', messenger, 1)
  await robot.move(new Instructions('RFRFRFRF'));

  const robot2 = new Robot('3 2 N', messenger,2)
  await robot2.move(new Instructions('FRRFLLFFRRFLL'));

  const robot3 = new Robot('0 3 W', messenger,3)
  await robot3.move(new Instructions('LLFFFLFLFL'));


  console.log(robot.toString())
  console.log(robot2.toString())
  console.log(robot3.toString())
})();
