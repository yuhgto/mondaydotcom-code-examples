import React, { useEffect } from "react";
import {
  AttentionBox,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableCell,
  TableBody,
  Label,
  Avatar,
  Icon,
} from "monday-ui-react-core";
import { File } from "monday-ui-react-core/icons";
import _ from "lodash";

const RenderItemsTable = ({ items, boardColumns, isLoading, isError }) => {
  const dataState = { isLoading, isError };

  const ErrorState = () => {
    return (
      <AttentionBox
      title="There was an error!"
      text="Please try again later" 
      type={AttentionBox.types.DANGER}
      />
    );
  };

  return isError ? (
    <ErrorState />
  ) : (
    <Table
      dataState={dataState}
      columns={boardColumns}
      errorState={<ErrorState />}
      emptyState={<></>}
      withoutBorder
    >
      <TableHeader>
        {boardColumns.map((headerCell, index) => (
          <TableHeaderCell key={index} title={headerCell.title} />
        ))}
      </TableHeader>
      <TableBody>
        {items.map((rowItem) => (
          <TableRow key={rowItem.id}>
            <TableCell key="name">{rowItem.name}</TableCell>
            {rowItem?.column_values.map((elt) => {
              if (elt.type === "status") {
                return (
                  <TableCell key={elt.id}>
                    {elt.text && (
                      <Label text={elt.text} color={Label.colors.PRIMARY} />
                    )}
                  </TableCell>
                );
              }
              if (elt.type === "people") {
                return (
                  <TableCell key={elt.id}>
                    {elt.text && (
                      <Avatar
                        size={Avatar.sizes.SMALL}
                        backgroundColor={_.sample(Avatar.colors)}
                        text={elt.text.substring(0, 1)}
                      />
                    )}
                  </TableCell>
                );
              }
              if (elt.type === "file") {
                return (
                  <TableCell key={elt.id}>
                    {elt.text && <Icon icon={File} />}
                  </TableCell>
                );
              } else {
                return <TableCell key={elt.id}>{elt.text}</TableCell>;
              }
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export const BoardTable = ({items}) => {
  const { data, loading, error } = items;
  let boardColumns: any = [];
  let boardItems: any = [];
  if (data?.boards) {
    boardColumns = data.boards[0]?.columns;
    boardItems = data.boards[0]?.items_page?.items;
  }

  useEffect(function logState () {
    console.log({ items, data, error });
  }, [items, data, error]);

  return (
    <div className="get-items-container feature-container">
      <RenderItemsTable
        items={boardItems}
        boardColumns={boardColumns}
        isLoading={loading}
        isError={!!error}
      />
    </div>
  );
};
