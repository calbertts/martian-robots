const { once, EventEmitter } = require('events');
const events                 = require('./events')

class Robot {
  messenger
  isLost = false;

  constructor(robotInfo, messenger) {
    const { x, y, orientation } = this._getParts(robotInfo);

    this.x           = Number(x);
    this.y           = Number(y);
    this.orientation = orientation;
    this.messenger  = messenger;
  }

  _getParts(robotInfo) {
    const MAX_COORDINATE = 50;
    const VALID_ORIENTATIONS = 'NSEW';

    let [x, y, orientation] = robotInfo.split(' ');

    x = Number(x);
    y = Number(y);

    if (x === NaN || x > MAX_COORDINATE || 
        y === NaN || y > MAX_COORDINATE || 
        !VALID_ORIENTATIONS.includes(orientation)) {
      throw new Error(`Bad Robot Syntax => expected: [Number < 50] [Number < 50] [String (NSEW)], actual: ${robotInfo}`)
    }

    return { x, y, orientation };
  }

  async move(instructions, delay = 0) {
    const movements = instructions.getMovements(this.orientation);

    for (let move of movements) {
      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
      
      if (this.isLost) {
        break;
      }

      const possibleMovement = {
        x: this.x + move.x,
        y: this.y + move.y
      };

      const [{shouldLost, shouldSkip}] = await this._canIMove(possibleMovement);

      if (shouldSkip) {
        continue;
      }
      
      if (shouldLost) {
        this.lost(possibleMovement);
      }

      this.x           = possibleMovement.x;
      this.y           = possibleMovement.y;
      this.orientation = move.o;

      this.messenger.emit(events.MOVED, {x: this.x, y: this.y, orientation: this.orientation});
    }

    this.messenger.emit(events.MOVEMENTS_FINISHED);
  }

  async _canIMove(possibleMovement) {
    process.nextTick(() => {
      this.messenger.emit(events.TRY_MOVE, possibleMovement);
    });
    return await once(this.messenger, events.MOVE_FEEDBACK);
  }

  lost(possibleMovement) {
    this.lastX = this.x;
    this.lastY = this.y;
    this.isLost = true;

    this.messenger.emit(events.IM_LOST, possibleMovement);
  }

  toString() {
    return `${this.lastX || this.x} ${this.lastY || this.y} ${this.orientation} ${this.isLost ? 'LOST' : ''}`.trim();
  }
}

module.exports = Robot;

