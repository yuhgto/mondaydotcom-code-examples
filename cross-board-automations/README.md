# Integration for contractor use case (proof of concept)

## Use Case

Our team works a lot with contractors. We want to be able to push tasks from our main board to our contractors' task boards without inviting our external contractors to the main (and internal) one.

## Overview of Integration

This code will let you automate the handoff process when a contractor is added to a task on the main board. When a contractor is added to the dropdown column, the integration will create an item on the contractor's dedicated project board. If the board doesn't exist, it will create one from a template. This allows managers to quickly send data about a project to the relevant contractor's board without worrying about them seeing items that are not applicable to them.

## Documentation

To set up this integration for testing, follow these steps:

### Create high-level board in monday.com

Create a high-level project board to track all of your team's work. Add a dropdown column for the contractors.

### Create/edit your .env file

This will contain your environment variables. Include the following environment variables:
PORT = the port your server will listen on
MONDAY_KEY = your monday.com API key
COLUMN_ID = the column ID of your contractor column

### Install node.js and dependencies

After installing node.js, install the project's dependencies by navigating to the project's directory and running `npm install`.

### Run server-side code

Start the integration server by running `node index.js`

### Set up webhook

Create a "when column changes, send a webhook" recipe on your board, and configure it with the public URL of your integration server.

We recommend using ngrok for setting up tunnels to localhost while you're testing :)
