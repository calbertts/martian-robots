const express          = require('express')
const bodyParser       = require('body-parser')
const { EventEmitter } = require('events');

const events           = require('../events');
const Runner           = require('../runner');
const { Mars }         = require('../mars');
const { Robot }        = require('../robot');
const { Instructions } = require('../instructions');

const app       = express()
const port      = 3000

let messenger;
let mars;
let robotInstructionsList;

app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('index');
})

app.post('/start', async (req, res) => {
  const {delay, fileContent} = req.body;

  messenger = new EventEmitter();

  try {
    ({ mars, robotInstructionsList } = Runner.getRobotInstructions(fileContent, messenger));

    res.json({
      mars,
      robots: robotInstructionsList.map(rI => rI[0])
    });

    await Runner.run(robotInstructionsList, delay);
  } catch(err) {
    res.status(400).json({message: err.toString()});
  }
})

app.get('/events', async function(req, res) {
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type':  'text/event-stream',
    'Connection':    'keep-alive'
  });
  res.flushHeaders();

  res.write('retry: 10000\n\n');

  messenger.on(events.IM_LOST, (coords) => {
    res.write(`event: ${events.IM_LOST}\ndata: ${JSON.stringify(coords)}\n\n`);
  });

  messenger.on(events.TRY_MOVE, (coords) => {
    res.write(`event: ${events.TRY_MOVE}\ndata: ${JSON.stringify(coords)}\n\n`);
  });

  messenger.on(events.MOVED, (moveInfo) => {
    res.write(`event: ${events.MOVED}\ndata: ${JSON.stringify(robotInstructionsList.map(rI => rI[0]))}\n\n`);
  });

  messenger.on(events.MOVE_FEEDBACK, (feedback) => {
    res.write(`event: ${events.MOVE_FEEDBACK}\ndata: ${JSON.stringify(feedback)}\n\n`);
  });

  messenger.on(events.MOVEMENTS_FINISHED, () => {
    const results = JSON.stringify(robotInstructionsList.map(rI => rI[0]).map(r => r.toString()))
    res.write(`event: ${events.MOVEMENTS_FINISHED}\ndata: ${results}\n\n\n`);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
