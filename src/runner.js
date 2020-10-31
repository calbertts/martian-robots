const Mars         = require('./mars');
const Robot        = require('./robot');
const Instructions = require('./instructions');

class Runner {
  static getRobotInstructions(content, messenger) {
    const robotInstructionsList = [];
    const lines = content
      .toString()
      .split('\n')
      .filter(line => line.trim() != '');

    const [ marsSize, ...robotsData ] = lines;

    const [w, h] = marsSize.split(' ').map(Number);
    const mars   = new Mars({ w, h, messenger });

    let robot;

    robotsData.forEach((robotDataLine, i) => {
      if ((i % 2) !== 0) {
        robotInstructionsList.push([robot, new Instructions(robotDataLine)]);
      } else {
        robot = new Robot(robotDataLine, messenger);
      }
    });

    return { mars, robotInstructionsList };
  }

  static async run(robotInstructionsList, delay) {
    for (let item of robotInstructionsList) {
      const [robot, instructions] = item;
      await robot.move(instructions, delay);
    }
  }
}

module.exports = Runner;
