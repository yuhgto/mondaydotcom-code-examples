import React from "react";
import { useState, useEffect, useReducer } from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
//Explore more Monday React Components here: https://style.monday.com/
import {Combobox, DialogContentContainer} from "monday-ui-react-core"

// Usage of mondaySDK example, for more information visit here: https://developer.monday.com/apps/docs/introduction-to-the-sdk/
const monday = mondaySdk();

function optionsReducer(options, action) {
  if (action.type === 'added') {
    return [...options, ...action.optionsToAdd];
  }
}

const App = () => {
  const [context, setContext] = useState();
  const [options, dispatch] = useReducer(optionsReducer, []);
  const [canRenderCombobox, setCanRenderCombobox] = useState(true);

  useEffect(() => {
    monday.listen("context", (res) => {
      setContext(res.data);
      console.log('Context updated.');
    });
  }, []);

  useEffect(() => {
    if (canRenderCombobox && context) {
      async function getItemNames() {
        const boardIds = context.boardIds
        var page = 1;

        var items_page = await monday.api(`
          query ($boardIds:[ID!]){
            boards (ids:$boardIds) { 
              items_page (limit:20) {
                cursor
                items {
                  name
                  id
                }
              } 
            } 
          }`, {variables: {boardIds} ,apiVersion: "2023-10"});
        page += 1;
        console.log('mapped stuff', items_page.data.boards[0].items_page.items.map(x => {return {label: x.name, id: x.id}}))
        setCanRenderCombobox(false);
        let optionsToAdd = items_page.data.boards[0].items_page.items.map(x => {return {label: x.name, id: x.id}});
        dispatch({
          type: 'added',
          optionsToAdd
        })
        console.log(`page ${page} loaded.\noptions to add:${JSON.stringify(optionsToAdd)}\nCurrent options:${JSON.stringify(options)}`);

        var cursor = items_page.data.boards[0].items_page.cursor
        while (cursor) {
          items_page = await monday.api(`
            query ($boardIds:[ID!], $cursor:String){
              boards (ids:$boardIds) { 
                items_page (limit:500, cursor:$cursor) {
                  cursor
                  items {
                    name
                    id
                  }
                } 
              } 
            }`, {variables: {boardIds, cursor} ,apiVersion: "2023-10"});
            let optionsToAdd = items_page.data.boards[0].items_page.items.map(x => {return {label: x.name, id: x.id}});
            dispatch({
              type: 'added',
              optionsToAdd
            })
            page += 1;
            console.log(`page ${page} loaded.`)
            console.log(`page ${page} loaded.\noptions to add:${JSON.stringify(optionsToAdd)}`);
            console.log('current options', options);
          cursor = items_page.data.boards[0].items_page.cursor;
        }
      }
      try {
        getItemNames();
      } catch (err) {
        console.log(err);
        return;
      }
    }
  }, [context, canRenderCombobox, options])

  return (
    <div className="App">
        <DialogContentContainer className="ComboboxContainer">
        <Combobox options={options} renderOnlyVisibleOptions maxOptionsWithoutScroll={3} size="large" loading={canRenderCombobox}/>
        </DialogContentContainer>
    </div>
  );
};

export default App;
