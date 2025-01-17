import React, { FC, PropsWithChildren, useMemo } from "react";
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
  ReferenceArea,
  Label,
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
  selectedItem?: ChartRow[];
}>;

export interface ChartRow {
  deal_value: number | null | undefined;
  riskiness: number | string | null | undefined;
  item_id: number | string;
  item_name: string;
}

export const AccountRiskChart: FC<AccountRiskChartProps> = ({ chartData, selectedItem }) => {
  // when you click an item, open item card
  const handleChartClick = ({ item_id }) => {
    monday.execute("openItemCard", { itemId: item_id }).then((result) => {
      console.log({ msg: "item card closed?", result });
    });
  };
  console.log({chartData});

  var [xMin, xMid, xMax] = useMemo(() => {
    var xMin = 1000000000; 
    var xMid;
    var xMax = 0;
    if (chartData) {
      chartData?.map((row) => {
        const deal_value:(number | null) = row?.deal_value ?? null;
        if (deal_value) {
          if (deal_value < xMin) xMin = deal_value
          if (deal_value > xMax) xMax = deal_value
        }
        return row;
      })
      xMid = xMin + ((xMax - xMin) / 2);
    }
    return [xMin, xMid, xMax]
  }, [chartData])

  var [yMin, yMid, yMax] = useMemo(() => {
    var yMin = 1000000000; 
    var yMid;
    var yMax = 0;
    if (chartData) {
      chartData?.map((row) => {
        const riskiness:(number | null) = parseInt(row?.riskiness?.toString() ?? "0");
        if (riskiness) {
          if (riskiness < yMin) yMin = riskiness
          if (riskiness > yMax) yMax = riskiness
        }
        return row;
      })
      yMid = yMin + ((yMax - yMin) / 2);
    }
    return [yMin, yMid, yMax]
  }, [chartData])

  // const [xMin, xMid, xMax, yMin, yMid, yMax] = [0,0,0,0,0,0]

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
        <ReferenceArea x1={xMin} x2={xMid} y1={yMid} y2={yMax} stroke="red" strokeOpacity={0.3} label={<Label value="DROP" position="insideTopLeft"/>} fillOpacity={0.3}/>
        <ReferenceArea x1={xMid} x2={xMax} y1={yMid} y2={yMax} stroke="red" strokeOpacity={0.3} label={<Label value="INVEST" position="insideTopRight"/>} fillOpacity={0.3}/>
        <ReferenceArea x1={xMin} x2={xMid} y1={yMin} y2={yMid} stroke="red" strokeOpacity={0.3} label={<Label value="QUICK WINS" position="insideBottomLeft"/>} fillOpacity={0.3}/>
        <ReferenceArea x1={xMid} x2={xMax} y1={yMin} y2={yMid} stroke="red" strokeOpacity={0.3} label={<Label value="IDEALS" position="insideBottomRight"/>} fillOpacity={0.3}/>
        <Scatter
          data={chartData}
          fill="#0073ea"
          onClick={handleChartClick}
          className="scatterPoint"
          shape="circle"
          isAnimationActive={false}
        >
          <LabelList dataKey="item_name" position="bottom"  className="dataPointLabel"/>
        </Scatter>
        <Scatter
          data={selectedItem}
          fill="#0073ea"
          onClick={handleChartClick}
          className="scatterPoint"
          shape="triangle"
          isAnimationActive={false}
        >
          <LabelList dataKey="item_name" position="bottom"  className="dataPointLabel"/>
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};
