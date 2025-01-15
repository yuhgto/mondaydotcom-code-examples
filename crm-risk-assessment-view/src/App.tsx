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
    if (!error) {
      setError({ msg: message, error });
    }
  }

  // CHECK: if settings contains the xAxis field
  useEffect(() => {
    if (!appContext.isLoading && appContext.data) {
      const selectedBoards = appContext?.data?.boardIds ?? [];
      if (selectedBoards.length === 0) {
        const message = "No board connected. Please select a board.";
        console.error(message);
        if (!error) setError({ msg: message, error: message });
      } else {
        setError(null); // flush error
      }
    }
    if (!settings.isLoading && settings.data) {
      if (!settings.data.hasOwnProperty("xAxis")) {
        const message =
          "No deal value column set. Did you add this settings field to the app feature?";
        console.error(message);
        if (!error) setError({ msg: message, error: message });
      } else if (settings.data.xAxis === null) {
        const message =
          "No deal value column set. Choose a column in the app settings.";
        console.error(message);
        if (!error) setError({ msg: message, error: message });
      } else {
        setError(null); // flush error
      }
    }
  }, [appContext, settings]);

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
        if (!error) throwError("Error fetching board items:", error);
      }
    };

    if (!appContext.isLoading && currentBoard.length !== 0) {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, payload } = action;
    switch (action.type) {
      case ReducerActionTypes.SET_ITEMS:
        return { ...state, items: action.payload.items, isItemsLoading: false };
      case ReducerActionTypes.SET_TIMELINE_FOR_ITEM:
        const itemId = payload.item_id;
        const itemTimeline = payload.timeline;
        var newTimelinesState = state.timelines ?? {};
        newTimelinesState[itemId] = itemTimeline;
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
          if (!error) throwError("Could not fetch item timelines", error);
        }
      });
    }
  }, [timelines?.items]);

  const boardIds = appContext?.data?.boardIds ?? [];

  // get x axis column from settings prop
  let dealValueColumn: Record<string, string[]> | undefined;
  let dealValueColumnMetadata: Record<string, any> | undefined | null;

  if (settings?.data && items?.data && settings.data.xAxis) {
    const cols: string[] = Object.keys(settings.data.xAxis);
    if (cols.length > 0) {
      // check that column is a number column
      const boards = items?.data?.data?.boards ?? [];
      const boardColumns = boards[0]?.columns;
      if (boardColumns && boardColumns.length > 0) {
        dealValueColumnMetadata = boardColumns.find((x) => x?.id === cols[0]);
        dealValueColumn = { [boardIds[0]]: [cols[0]] };
        if (dealValueColumnMetadata?.type !== "numbers") {
          const errorMessage = "Please select a number column for deal value.";
          console.error(errorMessage);
          if (!error) setError({ msg: errorMessage, error: errorMessage });
        }
      } else {
        const errorMessage = "Error: There are no columns on the board.";
        if (!error) throwError(errorMessage, errorMessage);
      }
    }
  }

  // set chart data from subitems count or risk level
  let chartData = useMemo(() => {
    try {
      const boards = items?.data?.data?.boards ?? [];
      if (boards?.length > 0 && dealValueColumn) {
        const data: ChartRow[] | undefined = [];
        let currentBoard = boardIds[0].toString();
        const itemsList = boards[0]?.items_page?.items ?? [];
        if (itemsList.length === 0) {
          const errorMessage =
            "Error retrieving data from board: Board has no items.";
          if (!error) throwError(errorMessage, errorMessage);
        }
        itemsList.map((item) => {
          // loop through the items on the board to set chart data
          let dealValue = item.column_values.find(
            (x) => x.id === dealValueColumn[currentBoard][0]
          );
          let timelineCount = timelines?.timelines?.[item.id]?.length ?? 0;
          const riskiness = timelineCount ?? 0;
          data?.push({
            deal_value: parseInt(dealValue?.text ?? "0"),
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
    } catch (error) {
      if (!error) throwError("Count not set chart data", error);
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
