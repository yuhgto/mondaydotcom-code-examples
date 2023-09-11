## Overview

This is an example to show how to lazyload a large number of items into a combobox. It demonstrates: 
- Cursor pagination with monday API
- Combobox component from monday vibe
- Virtualized list
- useReducer to manage complex state

## Clone the project

Clone the code by running: 
`npx degit github:yuhgto/mondaydotcom-code-examples/combobox-lazyload`

## Run the project

In the project directory, you should run:

### `npm install`

After installing, run the dev server: 

### `npm run server`

In another terminal, run an ngrok tunnel at port 8301: 

### ngrok http 8301

Now you can configure the rest of the app in monday and connect it to your development server. 

## Configure Monday App 

1. Open monday.com, login to your account and go to a "Developers" section.
2. Create a new "QuickStart View Example App"
3. Open "OAuth & Permissions" section and add "boards:read" scope
4. Open "Features" section and create a new "Boards View" feature
5. Open "View setup" tab and fill in "Custom URL" field your monday tunnel public URL, which you got previously (example: https://unsightly-chickaree-35.tunnel.monday.app)
6. Click "Boards" button and choose one of the boards with some data in it.
7. Click "Preview button"
8. Enjoy the example app!