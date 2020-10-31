const events = require('./events')

class Mars {
  constructor({w, h, messenger}) {
    if (isNaN(w) || isNaN(h) || Number(w) <= 0 || Number(h) <= 0) {
      throw new Error(`Mars size must be positive numbers like (w, h): 4 5, actual: "${w} ${h}"`)
    }

    this.maxX = w+1;
    this.maxY = h+1;
    this.scents = [];
    this.messenger = messenger;

    messenger.on(events.TRY_MOVE, this.tryMove.bind(this));
    messenger.on(events.IM_LOST, this.lostRobot.bind(this));
  }

  tryMove(possibleMovement) {
    let shouldSkip = false;
    let shouldLost = false;

    if (this._willBeLost(possibleMovement)) {
      if (!this._isAScent(possibleMovement)) {
        shouldLost = true;
      } else {
        shouldLost = false;
        shouldSkip = true;
      }
    }

    this.messenger.emit(events.MOVE_FEEDBACK, {shouldLost, shouldSkip});
  }

  lostRobot(scent) {
    this.scents.push(scent);
  }

  _isAScent(possibleMovement) {
    return !!this.scents.find(robotScent => 
      robotScent.x === possibleMovement.x && robotScent.y === possibleMovement.y
    );
  }

  _willBeLost(possibleMovement) {
    return possibleMovement.x >= this.maxX || possibleMovement.y >= this.maxY;
  }
}

module.exports = Mars;

