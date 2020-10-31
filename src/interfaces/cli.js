const { EventEmitter } = require('events');
const fs               = require('fs');
const readline         = require('readline');
const chalk            = require('chalk');

const events       = require('../events');
const Mars         = require('../mars');
const Robot        = require('../robot');
const Instructions = require('../instructions');
const Runner       = require('../runner');

(async () => {
  const argv = require('minimist')(process.argv.slice(2));

  async function ask(rl, question) {
    return new Promise((resolve) => {
      rl.question(question, input => {
        resolve(input);
      });
    })
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  try {
    const END                 = 'END';
    const messenger           = new EventEmitter();
    let robotInstructionsList = [];

    if (Boolean(process.stdin.isTTY)) {  // ---> Interactive input
      const marsSize = await ask(rl, `What's the Mars size? (w,h): `);

      const [w, h] = marsSize.split(' ').map(Number);
      const mars   = new Mars({ w, h, messenger });

      let robotCoords = '';

      while (robotCoords.toUpperCase() !== END) {
        robotCoords = await ask(rl, `\n${chalk.blue('Write END to finish the robots entries.')}\nEnter the start robot coordinates and orientation? (e.g: 1 1 E): `);

        if (robotCoords.toUpperCase() === END) {
          break;
        }
        
        const robot = new Robot(robotCoords, messenger);

        let instructionsStr = await ask(rl, `Enter the instructions to move the robot? (e.g: RLFLR): `);
        const instructions = new Instructions(instructionsStr);

        robotInstructionsList.push([robot, instructions]);
      }
    } else {  // ---> Reading from STDIN
      robotInstructionsList = Runner.getRobotInstructions(fs.readFileSync(0), messenger).robotInstructionsList;
    }

    if (argv.detailed) {
      messenger.on(events.IM_LOST, ({x, y}) => {
        console.log(`${chalk.red.bold('Robot lost at')} (${x},${y})`);
      });

      messenger.on(events.TRY_MOVE, ({x, y}) => {
        console.log(`${chalk.blue('Trying to move to')} (${x},${y})`);
      });

      messenger.on(events.MOVE_FEEDBACK, ({shouldLost, shouldSkip}) => {
        if (shouldSkip) {
          console.log(chalk.green.bold('Skiping a scent! :)'))
        }
      });

      messenger.on(events.MOVEMENTS_FINISHED, () => {
        console.log(chalk.green.yellow.bold('Robot movements finished!'))
      });
    }

    messenger.on(events.MOVEMENTS_FINISHED, (robot) => {
      console.log(chalk.green(robot.toString()));
    });

    console.log('');
    await Runner.run(robotInstructionsList, 0);
    console.log('');

    rl.close();
  } catch(err) {
    console.error(err);
    rl.close();
  }
})();
