# monday.com Code Examples

This repo contains three examples of integrations you can set up with the monday.com API. One is written in Python and two are in NodeJS.

Each folder contains a README that goes deeper into how to set up and test the code example. 

## Zendesk Import Example: Python

This example uses Python to import a set of Zendesk tickets into monday.com. This is amazing if you want to use monday.com as a repository of old ticket examples.

## Cross-board Automation: NodeJS

This is an example of how you can use our API to extend the capabilities of our automations. In this example, items from a private board are sent to individual task boards when they are assigned to that person.

## Tic Tac Toe: NodeJS

This one's for fun :) Play tic tac toe with monday.com! 

## Query Examples in testing environment

Here are some basic query examples to get you started. 

### Get all items from a given board


```
query {
  boards (ids:162169280) {
    id
    name
    items {
      id
    }
  }
}
```

### Create a new item on a board

```
mutation {
  create_item (item_name:"Hey friends!", board_id:162169280) {
    id
  }
}
```

### Change the value of a specific column on a specific item

```
mutation {
  change_column_value (board_id:162169280, item_id:441822004, column_id:"status", value:"{\"label\" : \"Done\"}") {
    id
  }
}
```

### Create a new item and assign its column values

```
mutation {
  create_item (item_name:"Hey friends!", board_id:162169280, column_values: "{\"status\" : {\"label\" : \"Done\"}, \"text\" : \"HEYTHERE\"}") {
    id
  }
}
```

### Get all items with the status "Done"

```
query {
  items_by_column_values(board_id:162169280, column_id:"status", column_value:"Done") {
    id
  }
}
```
