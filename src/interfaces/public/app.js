const events = Object.freeze({
  TRY_MOVE:           'TRY_MOVE',
  MOVED:              'MOVED',
  IM_LOST:            'IM_LOST',
  MOVE_FEEDBACK:      'MOVE_FEEDBACK',
  MOVEMENTS_FINISHED: 'MOVEMENTS_FINISHED'
});

function log(msg) {
  const logs = document.querySelector('.logs');
  logs.innerHTML += msg + '\n';
  logs.scrollTop = logs.scrollHeight;
}

function event(source, event, callback) {
  source.addEventListener(events[event], e => {
    callback(JSON.parse(e.data));
  });
}

function listen(mars) {
  const source = new EventSource('/events');
  const ev = event.bind(null, source);

  ev(events.IM_LOST, ({x, y})                         => log(`Robot lost at (${x}, ${y})`));
  ev(events.TRY_MOVE, ({x, y})                        => log(`Trying to move to (${x}, ${y})`));
  ev(events.MOVED, robots                             => draw(gridData(mars, robots)));
  ev(events.MOVE_FEEDBACK, ({shouldLost, shouldSkip}) => shouldSkip ? log('Skiping a scent! :)'):'');
  ev(events.MOVEMENTS_FINISHED, robots                => log(`Robot movements finished\n\nRESULTS:\n\n${robots.join('\n')}.\n`));
}

function start() {
  setTimeout(async () => {
    const url = '/start';
    const instructions = document.querySelector('.instructions').value;

    if (instructions.trim() === '') {
      alert('Enter the instructions!')
      return;
    }

    const data = {
      delay:       500,
      fileContent: instructions 
    };

    try {
      const response = await fetch(url, {
        method:  'POST',
        body:    JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw response;
      }

      const { mars, robots } = await response.json();
      listen(mars);
      draw(gridData(mars, robots));
    } catch(err) {
      try {
        err = await err.json();
      } finally {
        alert(err);
      }
    }
  }, 500);
}

function gridData(mars, robots) {
  const data      = new Array();
  const maxWidth  = (mars.maxX-1) + 3;
  const maxHeight = (mars.maxY-1) + 3;
  const width     = (600 / maxWidth);
  const height    = (600 / maxHeight);

  let xpos = 1;
  let ypos = 1;

  const arrows = { S: '⇡', N: '⇣', W: '⇠', E: '⇢' };
  
  for (let row = 0; row < maxHeight; row++) {
    data.push( new Array() );
    
    for (let column = 0; column < maxWidth; column++) {
      const robot = robots.find(r => r.x === (column-1) && r.y === (row-1));

      data[row].push({
        x:      xpos,
        y:      ypos,
        width:  width,
        height: height,
        isLost: robot ? robot.isLost : false,
        text:   robot ? arrows[robot.orientation] : '',
        column,
        row,
      })
      xpos += width;
    }
    xpos = 1;
    ypos += height;	
  }

  return data;
}

function isOutside(d, gridData) {
  return d.column === 0 || d.row === 0 || d.column === gridData[0].length-1 || d.row === gridData.length-1;
}

function draw(gridData) {
  let grid = document.querySelector('.grid > svg');
  if (grid) {
    grid.parentNode.removeChild(grid);
  }

  grid = d3.select('.grid')
    .append('svg').attr('width', '620px').attr('height', '620px'); 

  const row = grid.selectAll('.row')
    .data(gridData).enter().append('g').attr('class', 'row');
    
  const group = row.selectAll('.square')
    .data((d) => d).enter().append('g');

  group
    .append('rect')
    .attr('class',   'square')
    .attr('x',       (d) => d.x)
    .attr('y',       (d) => d.y)
    .attr('width',   (d) => d.width)
    .attr('height',  (d) => d.height)
    .style('fill',   (d) => {
      if (isOutside(d, gridData)) {
        return d.isLost ? '#e4c6c6' : '#ddd'
      } else {
        return '#fff'
      }
    })
    .style('stroke', '#222');

  group
    .append('text')
    .attr('x', (d) => d.x + (d.width/2) - 5)
    .attr('y', (d) => d.y + (d.height/2) + 5)
    .text((d) => d.text)

  grid.attr('transform', 'scale(1, -1)')
}
