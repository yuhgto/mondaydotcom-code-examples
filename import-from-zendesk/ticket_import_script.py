
# Ever wanted to put a bunch of tickets on a board?
# Well, this is the script for you :)

# This script will search for tickets based on a query, and then print those tickets
# It will then prompt the user to add the ticket to the board if relevant

# For this example to work, ensure you have a text and link column on your board. 

# do imports
import requests
import json
from urllib.parse import urlencode

# helper function to add item with relevant data to board
# params:
#   api_key = user's API key, for authorization
#   name = item name
#   board = board ID
#   column_data = dictionary containing column values
def add_to_board(api_key, board, name, column_data):
    headers = {"Authorization" : api_key}
    monday_url = 'https://api.monday.com/v2'

    # store request body in a dict, including variables
    req_data = {"query" : "mutation($name: String!, $board: Int!, $columns: JSON!)\
    {create_item(item_name:$name, board_id:$board, column_values:$columns) \
    {name id column_values {id value}}\
    }",
    "variables" : {"name" : name, "board" : board, "columns" : json.dumps(column_data)}} # send columns as a variable to prevent string manipulation

    # make HTTP POST using requests
    r = requests.post(url=monday_url, json=req_data, headers=headers)
    if r.status_code != 200:  # throw exception
        print('Status:', r.status_code)
        raise Exception("Add to board failed:", r.json())

    return r

if __name__ == "__main__" :

    # set Zendesk keys
    user = "YOUR_EMAIL_HERE"
    user = user + "/token"
    pwd = "YOUR_ZD_TOKEN_HERE"

    # set monday.com keys
    monday_key = "YOUR_MONDAYDOTCOM_KEY_HERE"
    board_id = 441834279

    zd_session = requests.Session()
    credentials = user, pwd
    zd_session.auth = credentials

    search_query = 'updated>1month' # query to search for tickets
    params = {
        'query': search_query,
        'sort_by': 'created_at',
        'sort_order': 'desc'        # from newest to oldest
    }

    search_url = 'https://monday.zendesk.com/api/v2/search.json?' + urlencode(params) # your zendesk account URL here

    # loop through each page of search
    while search_url != None:
        # make the request
        response = zd_session.get(search_url)
        if response.status_code != 200:
            print('Status:', response.status_code, 'Problem with the request. Exiting.')
            exit()

        ticket_list = response.json()
        print("Tickets acquired. Beginning import.")

        # loop through results of search
        for ticket in ticket_list['results']:
            if ticket['result_type'] != 'ticket': # skip if not a ticket (user, comment, etc)
                continue

            # change this line with the data you are importing
            url = "https://monday.zendesk.com/agent/tickets/" + str(ticket['id'])
            status = ticket['status']
            cols = column_data = {"link" : {"url" : url, "text" : "ZD Link"}, "text" : status}

            # add item to board
            r = add_to_board(monday_key, board_id, ticket['subject'], cols)
            print("Imported ticket ", ticket['id'], " to board.")

            # go to the next page or exit if there is no next page
            search_url = ticket_list['next_page']
