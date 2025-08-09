import React from 'react';
import ReactPaginate from 'react-paginate';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const AdvancedPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onRefresh,
  loading = false,
  showItemsPerPage = true,
  showTotalInfo = true,
  showRefresh = true,
  itemsPerPageOptions = [5, 10, 25, 50, 100],
  marginPagesDisplayed = 2,
  pageRangeDisplayed = 5
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Calculate display values
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Handle page change from ReactPaginate (0-based index)
  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1; // Convert to 1-based
    onPageChange(selectedPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = parseInt(event.target.value);
    onItemsPerPageChange(newItemsPerPage);
  };

  // Quick navigation handlers
  const handleFirstPage = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handleLastPage = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  // Responsive settings
  const responsiveSettings = {
    marginPagesDisplayed: isMobile ? 1 : marginPagesDisplayed,
    pageRangeDisplayed: isMobile ? 3 : isTablet ? 4 : pageRangeDisplayed
  };

  if (totalPages <= 1 && !showTotalInfo) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: 2,
        p: 2,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Left Section - Items Info and Controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: 2,
          flex: 1
        }}
      >
        {/* Total Items Info */}
        {showTotalInfo && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Showing
            </Typography>
            <Chip
              label={`${startItem}-${endItem}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
            <Typography variant="body2" color="text.secondary">
              of
            </Typography>
            <Chip
              label={totalItems.toLocaleString()}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
            <Typography variant="body2" color="text.secondary">
              items
            </Typography>
          </Box>
        )}

        {/* Items Per Page Selector */}
        {showItemsPerPage && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Per Page</InputLabel>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              label="Per Page"
              disabled={loading}
              sx={{
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }
              }}
            >
              {itemsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{option}</Typography>
                    {option === itemsPerPage && (
                      <Chip size="small" label="current" color="primary" />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Refresh Button */}
        {showRefresh && (
          <Tooltip title="Refresh data">
            <IconButton
              onClick={onRefresh}
              disabled={loading}
              color="primary"
              sx={{
                backgroundColor: 'action.hover',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText'
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Center Section - Pagination */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            justifyContent: 'center',
            flex: isMobile ? 'none' : 2
          }}
        >
          {/* Quick Navigation - First Page */}
          <Tooltip title="First page">
            <span>
              <IconButton
                onClick={handleFirstPage}
                disabled={currentPage <= 1 || loading}
                size="small"
                color="primary"
              >
                <FirstPageIcon />
              </IconButton>
            </span>
          </Tooltip>

          {/* React Paginate Component */}
          <ReactPaginate
            previousLabel={<PrevIcon />}
            nextLabel={<NextIcon />}
            breakLabel="..."
            pageCount={totalPages}
            marginPagesDisplayed={responsiveSettings.marginPagesDisplayed}
            pageRangeDisplayed={responsiveSettings.pageRangeDisplayed}
            onPageChange={handlePageClick}
            forcePage={currentPage - 1} // Convert to 0-based for ReactPaginate
            containerClassName="pagination-container"
            pageClassName="pagination-page"
            pageLinkClassName="pagination-link"
            previousClassName="pagination-previous"
            previousLinkClassName="pagination-previous-link"
            nextClassName="pagination-next"
            nextLinkClassName="pagination-next-link"
            breakClassName="pagination-break"
            breakLinkClassName="pagination-break-link"
            activeClassName="pagination-active"
            disabledClassName="pagination-disabled"
            renderOnZeroPageCount={null}
          />

          {/* Quick Navigation - Last Page */}
          <Tooltip title="Last page">
            <span>
              <IconButton
                onClick={handleLastPage}
                disabled={currentPage >= totalPages || loading}
                size="small"
                color="primary"
              >
                <LastPageIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}

      {/* Right Section - Page Info */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          justifyContent: isMobile ? 'center' : 'flex-end',
          flex: 1
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Page
        </Typography>
        <Chip
          label={currentPage}
          size="small"
          color="primary"
          sx={{ fontWeight: 'bold', minWidth: '40px' }}
        />
        <Typography variant="body2" color="text.secondary">
          of
        </Typography>
        <Chip
          label={totalPages}
          size="small"
          color="secondary"
          sx={{ fontWeight: 'bold', minWidth: '40px' }}
        />
      </Box>

      {/* Custom Styles for ReactPaginate */}
      <style jsx global>{`
        .pagination-container {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .pagination-page,
        .pagination-previous,
        .pagination-next,
        .pagination-break {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pagination-link,
        .pagination-previous-link,
        .pagination-next-link,
        .pagination-break-link {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
          padding: 6px 12px;
          border: 1px solid ${theme.palette.divider};
          border-radius: 8px;
          background-color: ${theme.palette.background.paper};
          color: ${theme.palette.text.primary};
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease-in-out;
          cursor: pointer;
          user-select: none;
        }

        .pagination-link:hover,
        .pagination-previous-link:hover,
        .pagination-next-link:hover {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          color: #1976d2;
          border-color: #2196f3;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(25, 118, 210, 0.2);
        }

        .pagination-active .pagination-link {
          background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
          color: #ffffff;
          border-color: #1976d2;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
        }

        .pagination-disabled .pagination-link,
        .pagination-disabled .pagination-previous-link,
        .pagination-disabled .pagination-next-link {
          background-color: ${theme.palette.action.disabledBackground};
          color: ${theme.palette.action.disabled};
          border-color: ${theme.palette.action.disabled};
          cursor: not-allowed;
          opacity: 0.6;
        }

        .pagination-disabled .pagination-link:hover,
        .pagination-disabled .pagination-previous-link:hover,
        .pagination-disabled .pagination-next-link:hover {
          background-color: ${theme.palette.action.disabledBackground};
          color: ${theme.palette.action.disabled};
          transform: none;
          box-shadow: none;
        }

        .pagination-break-link {
          border: none;
          background: none;
          color: ${theme.palette.text.secondary};
          cursor: default;
        }

        .pagination-break-link:hover {
          background: none;
          color: ${theme.palette.text.secondary};
          transform: none;
          box-shadow: none;
        }

        /* Mobile responsive styles */
        @media (max-width: 600px) {
          .pagination-link,
          .pagination-previous-link,
          .pagination-next-link {
            min-width: 32px;
            height: 32px;
            padding: 4px 8px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </Box>
  );
};

export default AdvancedPagination;
