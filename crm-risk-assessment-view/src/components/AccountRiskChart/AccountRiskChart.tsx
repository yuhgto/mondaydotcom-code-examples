import React, {
  FC,
  PropsWithChildren,
} from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
} from "recharts";
import "./AccountRiskChart.scss";
import mondaySdk from "monday-sdk-js";

const monday = mondaySdk();

type AccountRiskChartProps = PropsWithChildren<{
  chartData: ChartRow[] | undefined;
}>;

type CustomTooltipProps = PropsWithChildren<{
  active: boolean;
  payload: Record<string, any>[];
  label: string;
}>;

export interface ChartRow {
  deal_value: number | string | null | undefined;
  riskiness: number | string | null | undefined;
  item_id: number | string;
  item_name: string;
}

export const AccountRiskChart: FC<AccountRiskChartProps> = ({
  chartData,
}) => {
  // when you click an item, open item card
  const handleChartClick = ({ item_id }) => {
    monday.execute("openItemCard", { itemId: item_id }).then((result) => {
      console.log({ msg: "item card closed?", result });
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ChartTooltip: FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const { item_name, item_id } = payload[0].payload;
      return (
        <div>
          <p>{`${item_name}`}</p>
          <p>{`ID: ${item_id}`}</p>
        </div>
      );
    }
  };

  // TODO: fix overlapping axis titles
  // TODO: use monday font
  // TODO: try to make a tooltip that looks mondayish
  return (
    <ResponsiveContainer
      className="responsiveContainer"
      height="90%"
      width="90%"
    >
      <ScatterChart
        className="riskChart"
        // style={chartStyles}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="deal_value"
          type="number"
          name="value"
          unit="$"
          label={{ value: "Deal Value", position: "insideBottom" }}
          padding={{left: 24}}
        />
        {/*TODO: Allow axis to go above 100k */}
        <YAxis
          dataKey="riskiness"
          type="number"
          name="risk"
          label={{ value: "Risk", angle: -90, position: "insideLeft"}}
          padding={{bottom: 24}}
        />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter
          data={chartData}
          fill="#0073ea"
          onClick={handleChartClick}
          className="scatterPoint"
          shape="triangle"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};
