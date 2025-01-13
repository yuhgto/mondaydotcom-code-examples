import React, { FC, PropsWithChildren } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Scatter,
  LabelList,
  TooltipProps,
} from "recharts";
import "./AccountRiskChart.scss";
import mondaySdk from "monday-sdk-js";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

const monday = mondaySdk();

type AccountRiskChartProps = PropsWithChildren<{
  chartData: ChartRow[] | undefined;
}>;

export interface ChartRow {
  deal_value: number | string | null | undefined;
  riskiness: number | string | null | undefined;
  item_id: number | string;
  item_name: string;
}

export const AccountRiskChart: FC<AccountRiskChartProps> = ({ chartData }) => {
  // when you click an item, open item card
  const handleChartClick = ({ item_id }) => {
    monday.execute("openItemCard", { itemId: item_id }).then((result) => {
      console.log({ msg: "item card closed?", result });
    });
  };
  console.log({chartData});

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const { item_name, item_id, deal_value, riskiness } = payload[0].payload;
      return (
        <div
          style={{
            border: "solid 1px #c3c6d4",
            background: "#f6f7fb",
            padding: "8px",
            borderRadius: "4px",
          }}
        >
          <p>{`${item_name}`}</p>
          <p>{`ID: ${item_id}`}</p>
          <p>{`Deal value: ${deal_value}`}</p>
          <p>{`Risk score: ${riskiness}`}</p>
        </div>
      );
    }
  };

  return (
    <ResponsiveContainer
      className="responsiveContainer"
      height="90%"
      width="90%"
    >
      <ScatterChart
        className="riskChart"
        margin={{right: 16, top: 16, left: 8, bottom: 8}}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {/*TODO: Allow axis to go above 100k */}
        <XAxis
          dataKey="deal_value"
          type="number"
          name="Deal value"
          label={{ value: "Deal Value", position: "insideBottom" }}
          padding={{ left: 12 }}
          height={50}
          domain={[0, 'auto']}
          tickFormatter={(l) => `$${l/1000}k`}
          allowDataOverflow
        />
        <YAxis
          dataKey="riskiness"
          type="number"
          name="Risk"
          label={{ value: "Risk", angle: -90, position: "insideLeft" }}
          
        />
        <ZAxis range={[300,300]}/>
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={<CustomTooltip />}
          isAnimationActive={false}
        />
        <Scatter
          data={chartData}
          fill="#0073ea"
          onClick={handleChartClick}
          className="scatterPoint"
          shape="circle"
          isAnimationActive={false}
        >
          <LabelList dataKey="item_name" position="bottom" />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};
