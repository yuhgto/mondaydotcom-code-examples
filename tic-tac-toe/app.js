// monday.com tic tac toe :)
// author: dipro bhowmik
// date: nov 5, 2019

// set up imports
const request = require('request-promise');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// set up globals
dotenv.config();


// set up middleware
const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);

// declare variables for API calls
const port = process.env.PORT;
const apiKey = process.env.MONDAY_KEY;
const webhookURL = process.env.WEBHOOK_URL;

// declare variables for board structure
const boardID = process.env.BOARD_ID;

const col1 = process.env.COLUMN_1;
const col2 = process.env.COLUMN_2;
const col3 = process.env.COLUMN_3;
const colIDs = [col1, col2, col3];

const row1 = process.env.ROW_1;
const row2 = process.env.ROW_2;
const row3 = process.env.ROW_3;
const rowIDs = [row1, row2, row3];

// Store board state in "data" object
// let data = {"apiKey" : apiKey, // API key
// "board" : boardID, // board ID
// "rows" : rows, // item IDs
// "columns" : cols, // column IDs
// "current_grid" : grid // 3x3 array representing current state of current_grid
// "next_move" : next_move // 1x2 array (tuple??) indicating coordinates of next move
// }

// ///////////////////////////////////////
//             HELPER FUNCTIONS         //
// ///////////////////////////////////////

// helper function to make an API call
// returns a promise
function makeAPICall(apiKey, query, variables) {
  // set payload of post request
  const data = {
    url: 'https://api.monday.com/v2',
    headers: { 'Authorization': apiKey },
    json: true,
    body: { 'query': query, 'variables': variables },
  };

  // make request
  return request.post(data)
    .then(function checkResponse(res) {
      if (!res) {
        throw ('Error in API call. Response is undefined.');
      }
      console.log('API call successfully made. Results:\n', res);
      return res;
    })
    .catch((err) => {
      console.log('There was an error with the API call. Error:', err);
      return err;
    });
}

// helper function to create a webhook on a given board
// returns a promise
function setWebhook(apiKey, boardID, webhookURL) {
  // set query and variables
  const query = 'mutation($board: Int!, $hook_url: String!){create_webhook(board_id:$board, url:$hook_url, event:change_column_value){id}}';
  const variables = { board: boardID, hook_url: webhookURL };

  // make call, return promise
  return makeAPICall(apiKey, boardID, webhookURL);
}

// clear board state (called at the beginning of each game)
// will make up to 9 async calls, resolved in Promise.all()
// throw error if board is already clear (not good)
function clearLastGame(data) {
  const apiKey = data.apiKey;
  const boardID = data.board;
  const rows = data.rows;
  const cols = data.columns;

  const query = 'query($rows:[Int!], $cols:[String!]){items(ids:$rows){column_values(ids:$cols){text value}}}';
  const variables = { 'rows': rows, 'cols': cols };
  const cellsToClear = [];

  return makeAPICall(apiKey, query, variables)
  // get cells that have data in them, if any
    .then((response) => {
      const { items } = response.data;
      for (let i = 0; i < 3; i += 1) { // rows
        for (let j = 0; j < 3; j += 1) { // columns
          let val = items[i].column_values[j].value;
          val = JSON.parse(val).index;
          if (val !== 5) {
            cellsToClear.push([i, j]);
          }
        }
      }
      if (cellsToClear.length === 0) {
        throw ('Board is already empty');
      }
      data.cells = cellsToClear;
      return data;
    })
  // if there are cells to clear, clear em :)
    .then((data) => {
      const { apiKey } = data;
      const promises = [];
      data.cells.forEach((cell) => {
        const row = data.rows[cell[0]];
        const column = data.columns[cell[1]];
        const val = JSON.stringify({ index: 5 });
        const query = 'mutation($board:Int!, $item:Int!, $column:String!, $val:JSON!){change_column_value(item_id:$item, board_id:$board, column_id:$column, value:$val){id}}';
        const variables = {
          board: data.board, item: row, column, val,
        };
        const apiCall = makeAPICall(apiKey, query, variables);
        promises.push(apiCall);
      });
      return Promise.all(promises);
    })
    .then((promises) => {
      console.log('All cells cleared :)');
      return promises;
    });
}

// get current state of board (getCurrentGrid)
// return: promise containing 3x3 array of current board
function getCurrentGrid(data) {
  const apiKey = data.apiKey;
  const boardID = data.board;
  const rows = data.rows;
  const cols = data.columns;

  const query = 'query($rows:[Int!], $cols:[String!]){items(ids:$rows){column_values(ids:$cols){text value}}}';
  const variables = { 'rows': rows, 'cols': cols };

  return makeAPICall(apiKey, query, variables)
    .then(function processGrid(response) {
      const grid = [['0', '0', '0'], // reference with [row, col]
        ['0', '0', '0'],
        ['0', '0', '0']];

      // get current board state (cell values) and convert to grid
      const items = response.data.items;
      for (let i = 0; i < 3; i += 1) { // rows
        for (let j = 0; j < 3; j += 1) { // columns
          const val = items[i].column_values[j].text;
          if (!val) {
            grid[i][j] = '';
          } else {
            grid[i][j] = val;
          }
        }
      }
      data.current_grid = grid;
      return data;
    })
    .catch((error) => {
      console.log('There was an error getting the current grid.');
    });
}

// helper function that checks if a 3x1 array contains all X or o
// returns boolean
function isWinningRow(row) {
  // if any of the elements are blank
  if (!row[0] || !row[1] || !row[2]) {
    return false;
  }
  // check if first and second element are the same
  if (row[0] !== row[1]) {
    return false;
  }
  // check if first and third element are the same
  if (row[0] !== row[2]) {
    return false;
  }
  // true if passes all tests
  return true;
}

// given the state of the board, check if anyone has won yet
function checkWinState(data) {
  if (!data) {
    throw ('Promise data is undefined. Please check.');
  }
  const grid = data.current_grid;
  const winMessage = 'Somebody won!!!';

  // check rows
  grid.forEach((row) => {
    if (isWinningRow(row)) {
      throw (winMessage);
    }
  });

  // check columns
  const col1 = [grid[0][0], grid[1][0], grid[2][0]];
  const col2 = [grid[0][1], grid[1][1], grid[2][1]];
  const col3 = [grid[0][2], grid[1][2], grid[2][2]];
  if (isWinningRow(col1) || isWinningRow(col2) || isWinningRow(col3)) {
    throw (winMessage);
  }

  // check diagonals
  const diag1 = [grid[0][0], grid[1][1], grid[2][2]];
  const diag2 = [grid[0][2], grid[1][1], grid[2][0]];
  if (isWinningRow(diag1) || isWinningRow(diag2)) {
    throw (winMessage);
  }
  return data;
}

// plan next move
// parameters: current state of board (data object)
// return: data object in a promise
// https://lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795/
// throw error if no more valid moves
function chooseNextMove(data) {
  // handle errors :)
  if (!data.current_grid) {
    throw ("Current grid is not defined. How can I choose a move if I don't know what the grid looks like?");
  }

  // get positions of valid moves
  const validMoves = [];
  const grid = data.current_grid;
  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      if (!grid[i][j]) {
        validMoves.push([i, j]);
      }
    }
  }

  // check if there are any valid moves...
  if (validMoves.length === 0) {
    throw ('No more valid moves. Game is over.');
  }

  // randomly select a next move
  data.next_move = validMoves[(Math.floor(Math.random() * validMoves.length))];
  return data;
}

// make move
// parameters: grid location of move
// return promise for move state
function makeMove(data) {
  if (!data.next_move) {
    throw ('Next move is undefined. HELP!');
  }
  const move = data.next_move;
  const row = data.rows[move[0]];
  const column = data.columns[move[1]];
  const val = JSON.stringify({ label: 'X' });

  const query = 'mutation($board:Int!, $item:Int!, $column:String!, $val:JSON!){change_column_value(item_id:$item, board_id:$board, column_id:$column, value:$val){id}}';
  const variables = {
    'board': data.board, 'item': row, 'column': column, 'val': val,
  };

  return makeAPICall(apiKey, query, variables);
}


// ///////////////////////////////////////
//            EXECUTION FLOW           //
// ///////////////////////////////////////

// return JSON upon POST request
app.post('/', function respondToPlayerMove(req, res) {
  res.status(200).send(req.body);

  // ignore if user ID is same as integration user
  if (req.body.event.userId === 4315579) {
    return null;
  }

  const data = {
    'apiKey': apiKey,
    'board': boardID,
    'rows': rowIDs,
    'columns': colIDs,
  };

  // check if move is valid
  const val = req.body.event.value.label.text;
  console.log('Player played:', val);

  // only 'O' is a valid move
  if (val !== 'O') {
    const col = req.body.event.columnId;
    const row = req.body.event.pulseId;
    const val = JSON.stringify({ 'index': 5 });
    const query = 'mutation($board:Int!, $item:Int!, $column:String!, $val:JSON!){change_column_value(item_id:$item, board_id:$board, column_id:$column, value:$val){id}}';
    const variables = {
      'board': data.board, 'item': row, 'column': col, 'val': val,
    };
    makeAPICall(data.apiKey, query, variables)
      .catch(function catchError(error) {
        console.log(error);
        return null;
      })
      .finally((result) => 0);
  } else {
    // upon player move, get data and make a move
    return getCurrentGrid(data) // makes an API call
      .then((data2) => {
        console.log('Current grid computed.');
        return checkWinState(data2);
      })
      .then((data3) => {
        console.log('Nobody has won yet. Moving on...');
        return chooseNextMove(data3);
      })
      .then((data4) => {
        console.log('Preparing to make my move.');
        return makeMove(data4);
      }) // makes an API call
      .catch((error) => {
        console.log(error);
        return 0;
      });
  }
  return 0;
});

server.listen(port, () => {
  // print port number
  console.log(`Express server listening on port ${port}.`);

  const data = {
    'apiKey': apiKey,
    'board': boardID,
    'rows': rowIDs,
    'columns': colIDs,
  };

  clearLastGame(data);
});
