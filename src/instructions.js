class Instructions {
  
  constructor(instructionsInfo) {
    this.MAX_INSTRUCTIONS = 100;
    this.instTable = {
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
    };

    instructionsInfo = instructionsInfo.trim();
    if (instructionsInfo.replace(/L|F|R/g, '').length > 0 || instructionsInfo.length > this.MAX_INSTRUCTIONS) {
      throw new Error(`Wrong instruction syntax, should be L, R or F and less than 100 chars, actual: ${instructionsInfo}`)
    }

    this.instructionsInfo = instructionsInfo;
    this.movements        = instructionsInfo.split('');
  }

  getMovements(startOrientation) {
    let o = startOrientation;

    return this.movements.map(move => {
      const movement = this.instTable[move][o];
      movement.command = move;
      o = movement.o;
      return movement;
    });
  }
}

module.exports = Instructions;

