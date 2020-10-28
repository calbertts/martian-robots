const express          = require('express')
const bodyParser       = require('body-parser')
const { EventEmitter } = require('events');

const events           = require('../events');
const { Mars }         = require('../mars');
const { Robot }        = require('../robot');
const { Instructions } = require('../instructions');

const app       = express()
const port      = 3000
const messenger = new EventEmitter();

app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('index');
})

app.post('/start', async (req, res) => {
  res.end()

  const mars = new Mars({ w: 5, h: 3, messenger });

  const robot = new Robot('1 1 E', messenger);
  await robot.move(new Instructions('RFRFRFRF'));
  console.log(robot.toString())

  const robot2 = new Robot('3 2 N', messenger);
  await robot2.move(new Instructions('FRRFLLFFRRFLL'));
  console.log(robot2.toString())

  const robot3 = new Robot('0 3 W', messenger);
  await robot3.move(new Instructions('LLFFFLFLFL'));
  console.log(robot3.toString())
})

app.get('/events', async function(req, res) {
  console.log('Got /events');
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();

  res.write('retry: 10000\n\n');
  let count = 0;

  messenger.on(events.IM_LOST, ({x, y}) => {
    res.write(`data: Robot lost at (${x}, ${y})\n\n`);
  });

  messenger.on(events.TRY_MOVE, ({x, y}) => {
    res.write(`data: Trying to move to (${x}, ${y})\n\n`);
  });

  messenger.on(events.MOVE_FEEDBACK, ({shouldLost, shouldSkip}) => {
    if (shouldSkip) {
      res.write(`data: Skiping a scent! :)\n\n`);
    }
  });

  messenger.on(events.MOVEMENTS_FINISHED, () => {
    res.write(`data: Robot movements finished.\n\n\n`);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
