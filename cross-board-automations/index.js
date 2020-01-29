// set up imports
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mondayClient = require('./monday-api-client.js');

dotenv.config();

// set up middleware
const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);

// declare globals
const port = process.env.PORT;
const mondayKey = process.env.MONDAY_KEY;
const contractorColumn = process.env.COLUMN_ID;

// initialize list of all boards for contractor planning
// return list like this:
// [{"name" : "Dipro", "board_id" : 12345}, {"name" : "Joseph", "board_id" : 22222}]
function getContractorBoards(apiKey) {
  let contractorBoards = {};
  let query = '{boards (newest_first:true, limit:100) { name id } }';
  let vars = {};
  return mondayClient.makeAPICall(apiKey, query, vars)
  .then((res) => {
    // for each board, check if it satisfies following naming convention: "Contractor John Doe - Projects"
    let boardsList = res.data.boards;
    boardsList.forEach((board) => {
      if (board.name.search("Contractor") != -1) {

        // get substring that contains contractor's name
        let dashIndex = board.name.search("-");
        let contractorName = board.name.substring(11, dashIndex-1);

        // add contractor name and board ID to "contractorBoards" list
        contractorBoards[contractorName] = board.id;
      }
    })
    return contractorBoards;
  })
  .catch((err) => {
    return err;
  });
}

function getItemName(apiKey, itemId) {
  let query = 'query($itemId:Int!){ items (ids:[$itemId]) { name } }';
  let vars = {"itemId" : itemId};

  return mondayClient.makeAPICall(apiKey, query, vars)
  .then(res => {
    console.log(res.data.items);
    return res;
  });
}

function createBoard(apiKey, boardName) {
  let query = 'mutation($bname: String!) { create_board (board_name:$bname, board_kind:share, template_id:435570136) { id } }';
  let vars = {"bname" : boardName};

  return mondayClient.makeAPICall(apiKey, query, vars);
}

function createItem(apiKey, itemName, boardId) {
  let query = 'mutation($itemName: String!, $boardId: Int!) { create_item (board_id:$boardId, item_name:$itemName) { id } }';
  let vars = {"itemName" : itemName, "boardId" : parseInt(boardId)};

  return mondayClient.makeAPICall(apiKey, query, vars)
  .then((res) => {
    console.log(res);
    return res;
  });
}

server.listen(port, () => { // initialize server listener
  console.log(`Express server listening on port ${port}.`);
});

// on webhook, run integration
app.post("/", (req, res) => {
  // return body (to satisfy challenge-response)
  console.log(req.body);
	res.status(200).send(req.body);

  // parse webhook body
  let webhookEvent = req.body.event;
  let itemId = webhookEvent.pulseId;

  // break if contractor column is not updated
  if (webhookEvent.columnId != contractorColumn) {
    return;
  }

  // break if array is empty
  if (webhookEvent.value == null) {
    return;
  }

  let itemName = getItemName(mondayKey, itemId)
  .then(item => {
    // assign item name to global "itemName"
    itemName = item.data.items[0].name;

    // get list of boards that belong to contractors
    return itemName;
  }).then(itemName => {
    return getContractorBoards(mondayKey);
  }).then(boards => {

    // add item to contractor's board
    // TODO: add logic to allow for multiple contractors
    let currentContractor = webhookEvent.value.chosenValues[0].name;
    console.log(currentContractor);

    // when person column is updated:
    // if contractor has a board, return board ID
    let currentBoard = boards[currentContractor];
    console.log(currentBoard);
    if (typeof currentBoard !== 'undefined') {
      return currentBoard;
    }

    // if contractor does not have a board, create a new board and return its ID
    let boardName = "Contractor " + currentContractor + " - Projects"
    return createBoard(mondayKey, boardName)
    .then(res => {
      currentBoard = res.data.create_board.id;
      return currentBoard;
    });
  }).then((board_id) => {
    return createItem(mondayKey, itemName, board_id);
  });


});
