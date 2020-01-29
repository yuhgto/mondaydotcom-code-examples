# Building tic tac toe in monday.com

## Why tic tac toe?

Because it's fun! And it's helpful to demonstrate how you can use a monday.com webhook to run some logic to make changes in monday.com.

## Setting up the code

### Step 1: Ensure your board is structured for Tic Tac Toe.

+ Add three items to the board
+ Add three status columns
+ For each status column, ensure there is a label for "X" and a label for "O"

### Step 2: Edit your .env file

+ Add your monday API key as the "MONDAY_KEY" variable
+ Add the column IDs of your three status columns as "COLUMN_1", "COLUMN_2", "COLUMN_3"
+ Add the item IDs of the three items that you are using for the rows in your tic tac toe board

### Step 3: Install and run

To install and run the code, you first need to install NodeJS and npm. Once you have installed this and configured your environment, run the following code to begin the app server:

```
npm install
node app.js
```

### Step 4: Set up webhook

Create a "when column changes, send a webhook" recipe on your board, and configure it with the public URL of your app server.

We recommend using ngrok for setting up tunnels to localhost while you're testing :) I usually run `ngrok http 3000` and point the webhook to the resulting URL.
