import { gql } from "graphql-request";

export const exampleQuery = gql`
  query GetBoards($ids: [ID!]) {
    boards(ids: $ids) {
      id
      name
    }
  }
`;

export const exampleMutation = gql`
  mutation CreateItem($boardId: ID!, $groupId: String!, $itemName: String!) {
    create_item(board_id: $boardId, group_id: $groupId, item_name: $itemName) {
      id
      name
    }
  }
`;

// Complexity = 6625, when using 1 board ID
export const getBoardItems = gql`
  query GetBoardItems ($boardId: [ID!], $cursor:String) {
    complexity {
      before
      after
      query
      reset_in_x_seconds
    }
    boards(ids: $boardId) {
        id
        columns {
            id
            title
            type
        }
        items_page (limit:200, cursor:$cursor) {
            items {
                id
                name
                column_values {
                    id
                    text
                    value
                    type
                }
                subitems {
                  id
                }
            }
            cursor
        }
    }
}
`

export const getItemTimeline = gql`
  query GetItemTimeline($itemId:ID!) {
    timeline(id:$itemId) {
      timeline_items_page {
        timeline_items {
          id
          custom_activity_id
          content
        }
        cursor
      }
    }
  }
`

export const getBoardItemsHeavy = gql`
query GetBoardItemsSlow($boardId:[ID!],$cursor: String) {
  complexity {
    before
    after
    query
    reset_in_x_seconds
  }
  boards (ids:$boardId) {
    id
    groups {
      title
      id
      items_page(limit: 50, cursor: $cursor) {
        items {
          id
          name
          column_values {
            column {
              id
              title
              type
            }
            id
            text
            value
            type
          }
        }
        cursor
      }
    }
  }
}
`