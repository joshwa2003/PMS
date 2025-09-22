import React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DataObjectIcon from '@mui/icons-material/DataObject';
import GridOnIcon from '@mui/icons-material/GridOn';
import { exportToCSV, exportToExcel, exportToPDF, exportToJSON } from 'utils/exportUtils';

export default function ExportMenu({ rows, columns, filename = 'job-analytics', title, headerLines, orientation }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const makeHandler = (fn, opts) => () => {
    fn(filename, rows, columns, { title, headerLines, orientation, ...(opts || {}) });
    handleClose();
  };

  return (
    <>
      <Button variant="contained" color="info" startIcon={<DownloadIcon />} onClick={handleClick}>
        Export
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={makeHandler(exportToCSV)}>
          <ListItemIcon><GridOnIcon fontSize="small" /></ListItemIcon>
          <ListItemText>CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={makeHandler(exportToExcel)}>
          <ListItemIcon><TableChartIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Excel (.xlsx)</ListItemText>
        </MenuItem>
        <MenuItem onClick={makeHandler(exportToPDF)}>
          <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
          <ListItemText>PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={makeHandler(exportToJSON)}>
          <ListItemIcon><DataObjectIcon fontSize="small" /></ListItemIcon>
          <ListItemText>JSON</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}


