/* eslint-disable react-hooks/exhaustive-deps */
import "./App.css";
import "@vibe/core/tokens";
import React, { useEffect, useState, useMemo, useReducer } from "react";
import { AttentionBox, Loader } from "@vibe/core";
import {
  ChartRow,
  AccountRiskChart,
} from "./components/AccountRiskChart/AccountRiskChart";
import { GetBoardItemsQuery, GetItemTimelineQuery } from "./generated/graphql";
import { useAppContext } from "./hooks/UseAppContext";
import { useAppSettings } from "./hooks/UseAppSettings";
import { getBoardItems, getItemTimeline } from "./queries.graphql";
import { SeamlessApiClient } from "@mondaydotcomorg/api";

type GetBoardItemsQueryResult = {
  data: GetBoardItemsQuery;
  loading: boolean;
  error: any;
};
type GetItemTimelineQueryResult = {
  data: GetItemTimelineQuery;
  loading: boolean;
  error: any;
};

const seamlessApiClient = new SeamlessApiClient("2025-01");

const App = () => {
  const appContext = useAppContext();
  const settings = useAppSettings();
  const currentBoard: string[] | number[] = appContext?.data?.boardIds ?? [];

  // Error state for component & helper function
  const [error, setError] = useState<{ msg: string; error: any } | null>(null);
  function throwError(message: string, error: any) {
    console.error(message, ": ", error);
    setError({ msg: message, error });
  }

  // API CALL: get items from board
  const [items, setItems] = useState<
    | {
        data: GetBoardItemsQueryResult;
        loading: boolean;
        error: any;
      }
    | undefined
  >();
  useEffect(() => {
    const fetchItemsFromBoard = async () => {
      try {
        const res: {
          data: GetBoardItemsQueryResult;
          method: string;
          requestId: string;
        } = await seamlessApiClient.request(getBoardItems, {
          boardId: currentBoard,
        });
        console.log({ boardItems: res });
        setItems({ data: res?.data, loading: false, error: res.data?.error });
      } catch (error) {
        throwError("Error fetching board items:", error);
      }
    };

    if (!appContext.isLoading) {
      fetchItemsFromBoard();
    }
  }, [currentBoard]);

  // Reducer to manage list of items & their CRM timelines
  enum ReducerActionTypes {
    SET_ITEMS = "SET_ITEM_IDS",
    SET_TIMELINE_FOR_ITEM = "SET_TIMELINE_FOR_ITEM",
  }
  interface TimelinesState {
    items: Array<{ id: number | string }> | null;
    timelines: Record<string, Array<TimelineData>> | null;
    isItemsLoading: boolean;
    isTimelinesLoading: boolean;
  }
  interface TimelineData {
    content: string | null;
    custom_activity_id: string | null;
    id: string | null;
  }
  interface TimelinesAction {
    type: ReducerActionTypes;
    payload: any;
  }
  const initialState = {
    items: null,
    timelines: null,
    isItemsLoading: true,
    isTimelinesLoading: true,
  };
  function timelinesReducer(state: TimelinesState, action: TimelinesAction) {
    const { type, payload } = action;
    console.log({ msg: `REDUCER CALL - ${action.type}`, type, payload }); //TODO: remove log
    switch (action.type) {
      case ReducerActionTypes.SET_ITEMS:
        return { ...state, items: action.payload.items, isItemsLoading: false };
      case ReducerActionTypes.SET_TIMELINE_FOR_ITEM:
        const itemId = payload.item_id;
        const itemTimeline = payload.timeline;
        var newTimelinesState = state.timelines ?? {};
        newTimelinesState[itemId] = itemTimeline;
        console.log(newTimelinesState); //TODO: remove log
        return {
          ...state,
          timelines: newTimelinesState,
          isTimelinesLoading: false,
        };
    }
  }

  const [timelines, dispatch] = useReducer(timelinesReducer, initialState);

  useEffect(() => {
    if (!items?.loading) {
      const boards = items?.data?.data?.boards ?? [];
      const itemIds =
        boards[0]?.items_page?.items.map((item) => {
          return { id: item.id };
        }) ?? [];
      dispatch({
        type: ReducerActionTypes.SET_ITEMS,
        payload: { items: itemIds ?? [] },
      });
    }
  }, [items]);

  // API CALL: get timelines for each item
  useEffect(() => {
    if (timelines?.items?.length > 0) {
      timelines?.items.map(async (item) => {
        try {
          const itemTimelineApiResult: {
            data: GetItemTimelineQueryResult;
            method: string;
            requestId: string;
          } = await seamlessApiClient.request(
            getItemTimeline,
            { itemId: item.id },
            "2025-01"
          );
          const itemTimelineData: Array<TimelineData> | undefined =
            itemTimelineApiResult.data.data?.timeline?.timeline_items_page
              ?.timeline_items;
          dispatch({
            type: ReducerActionTypes.SET_TIMELINE_FOR_ITEM,
            payload: { item_id: item.id, timeline: itemTimelineData },
          });
        } catch (error) {
          throwError("Could not fetch item timelines", error);
        }
      });
    }
  }, [timelines?.items]);

  const boardIds = appContext?.data?.boardIds ?? [];

  // get x axis column from settings prop
  let dealValueColumn:Record<string, string[]> | undefined;
    if (!settings.isLoading && !items?.loading) {
      if (settings?.data && items?.data) {
        console.log({ settings: settings.data }); //TODO: remove log
        const cols: string[] = Object.keys(settings.data.xAxis);
        if (cols.length > 0) {
  
          // check that column is a number column
          const boards = items?.data?.data?.boards ?? [];
          const boardColumns = boards[0]?.columns;
          if (boardColumns && boardColumns.length > 0) {
            const dealValueColumnMetadata = boardColumns.find(x => x?.id === cols[0])
            if (dealValueColumnMetadata) {
              console.log({dealValueColumnMetadata})
              if (dealValueColumnMetadata.type !== 'numbers') {
                // TODO: when this error is thrown, it never unthrows
                const errorMessage = 'Please select a number column for deal value.';
                throwError(errorMessage,errorMessage)
              } else {
                dealValueColumn = { [boardIds[0]]: [cols[0]] };
              }
            }
          } else {
            const errorMessage = 'Error: There are no columns on the board.';
            throwError(errorMessage,errorMessage)
          }
        }
      }
    }

  // set chart data from subitems count or risk level
  let chartData = useMemo(() => {
    try {
      // TODO: get timeline count from the itemsList prop and then make it work
      // TODO: In video, show how to change it from counting activities to counting subitems
      // & getting number from a column
      // TODO: remove logic to count multiple boards (and then re-add it in the video)
      const boards = items?.data?.data?.boards ?? [];
      if (boards?.length > 0 && dealValueColumn) {
        const data: ChartRow[] | undefined = [];
        let currentBoard = boardIds[0].toString();
        const itemsList = boards[0]?.items_page?.items ?? [];
        if (itemsList.length === 0) {
          const errorMessage = "Error retrieving data from board: Board has no items.";
          throwError(errorMessage, errorMessage)
        }
        itemsList.map((item) => { // loop through the items on the board to set chart data
          // console.log({ item });
          let dealValue = item.column_values.find(
            (x) => x.id === dealValueColumn[currentBoard][0]
          );
          let subitemCount = item.subitems?.length ?? 0;
          let timelineCount = timelines?.timelines?.[item.id]?.length ?? 0; 
          const riskiness = timelineCount ?? subitemCount ?? 0; // TODO: Calculate riskiness using subitems or column value as well
          // console.log({ boardIds, item, xColumn, columns });
          data?.push({
            deal_value: dealValue?.text,
            riskiness,
            item_id: item.id,
            item_name: item.name,
          });
          return item;
        });
        console.log({ data });
        if (data) {
          return data; // this will break for multiple boards (widget)
        }
      } 
      // TODO: figure out how this can run
      // else if (!dealValueColumn && !settings.isLoading && !appContext.isLoading) {
      //   if (settings.data?.xAxis) {
      //     // TODO: validate that this works
      //     const message =
      //       "No deal value column set. Did you add this settings field to the app feature?";
      //     throwError(message, message);
      //   }
      // }
    } catch (error) {
      throwError("Count not set chart data", error);
    }
  }, [items, boardIds, dealValueColumn]);

  const loading =
    !items ||
    items.loading ||
    timelines?.isItemsLoading ||
    appContext.isLoading ||
    settings.isLoading;

  return (
    <div className="App">
      {loading && !error && <Loader size="medium" className="Loader" />}
      {!loading && !error && <AccountRiskChart chartData={chartData} />}
      {error && (
        <AttentionBox
          text={
            JSON.stringify(error, null, 2) ??
            "Check the console for more information"
          }
          title="Application error"
          type={AttentionBox.types.DANGER}
        />
      )}
    </div>
  );
};

export default App;
