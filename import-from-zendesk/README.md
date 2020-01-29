# Importing tickets from Zendesk to monday.com

## Description

This utility imports Zendesk tickets to a monday.com board. You can use it as an example to build your own monday.com import scripts!

The script also uses the [Zendesk Search API](https://developer.zendesk.com/rest_api/docs/support/search#search) to get a set of tickets to import.

## Why it works

Take note of a couple of elements that make this script work well with GraphQL: 
+ The script implements an `add_to_board()` function to call the monday.com API and create a new item. 
+ We store monday.com column values in a dictionary and send it as a [GraphQL variable](https://graphql.org/learn/queries/#variables). 
+ We convert the values to JSON the using the `json.dumps()` function.

#### Field mappings

+ Ticket subject is mapped to the [monday.com item name](https://monday.com/developers/v2#column-values-section-name)
+ Ticket status is mapped to a [text column](https://monday.com/developers/v2#column-values-section-text)
+ Ticket URL is mapped to a [link column](https://monday.com/developers/v2#column-values-section-link)

## Usage

```bash
pip install -r requirements.txt
python3 main.py
```

## Dependencies

This script is very simple, and only needs the Python `requests` library as a dependency. It also uses `json` and `urllib` but these packages may have been shipped with your Python environment.

## License

[MIT](https://choosealicense.com/licenses/mit/)
