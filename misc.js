class Instruction {
    #command
    #xSteps
    #ySteps

    constructor(command, xSteps, ySteps) {
    this.#command = command;
    this.#xSteps  = xSteps
    this.#ySteps  = ySteps
  }
}

class LeftInstruction extends Instruction {
  constructor() {
    super('L', 0, 0);
  }
}

class RightInstruction extends Instruction {
  constructor() {
    super('R', 0, 0);
  }
}

class ForwardInstruction extends Instruction {
  constructor() {
    super('F', 1, 0);
  }
}



class Orientation {
    #command
    #xAxis
    #yAxis

    constructor(command, xSteps, ySteps) {
    this.#command = command;
    this.#xSteps  = xSteps
    this.#ySteps  = ySteps
  }
}

class NorthOrientation extends Instruction {
  constructor() {
    super('N', 1, 0);
  }
}
