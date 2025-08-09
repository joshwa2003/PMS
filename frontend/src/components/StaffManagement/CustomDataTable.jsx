import React from "react";
import PropTypes from "prop-types";

// @mui material components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

// S.A. Engineering College React components
import MDBox from "components/MDBox";

// S.A. Engineering College React example components
import DataTableHeadCell from "examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "examples/Tables/DataTable/DataTableBodyCell";

function CustomDataTable({ table, isSorted, noEndBorder }) {
  const { columns, rows } = table;

  // A function that sets the sorted value for the table
  const setSortedValue = (column) => {
    let sortedValue;

    if (isSorted && column.isSorted) {
      sortedValue = column.isSortedDesc ? "desc" : "asce";
    } else if (isSorted) {
      sortedValue = "none";
    } else {
      sortedValue = false;
    }

    return sortedValue;
  };

  return (
    <TableContainer sx={{ boxShadow: "none" }}>
      <Table>
        <MDBox component="thead">
          {columns && (
            <TableRow>
              {columns.map((column, idx) => (
                <DataTableHeadCell
                  key={idx}
                  width={column.width ? column.width : "auto"}
                  align={column.align ? column.align : "left"}
                  sorted={setSortedValue(column)}
                >
                  {column.Header}
                </DataTableHeadCell>
              ))}
            </TableRow>
          )}
        </MDBox>
        <TableBody>
          {rows.map((row, key) => (
            <TableRow key={key}>
              {columns.map((column, idx) => (
                <DataTableBodyCell
                  key={idx}
                  noBorder={noEndBorder && rows.length - 1 === key}
                  align={column.align ? column.align : "left"}
                >
                  {row[column.accessor]}
                </DataTableBodyCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Setting default values for the props of CustomDataTable
CustomDataTable.defaultProps = {
  isSorted: true,
  noEndBorder: false,
};

// Typechecking props for the CustomDataTable
CustomDataTable.propTypes = {
  table: PropTypes.objectOf(PropTypes.array).isRequired,
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,
};

export default CustomDataTable;
