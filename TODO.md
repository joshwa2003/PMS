# Fix Student Management Pagination

## Task: Replace basic pagination in BatchStudentsView with AdvancedPagination component

### Steps to Complete:
- [x] Import AdvancedPagination component in BatchStudentsView.jsx
- [x] Update BatchStudentDataTable component to use AdvancedPagination
- [x] Replace the basic Previous/Next pagination with advanced numbered pagination
- [x] Update pagination handling logic to work with AdvancedPagination
- [x] Ensure proper page change handling and data fetching
- [x] Fix pagination state management for proper page navigation
- [x] Fix ESLint errors (unused imports, undefined variables, missing dependencies)
- [x] Fix table flickering issue by optimizing useCallback dependencies
- [x] Fix page change callback to properly call parent fetchBatchStudents function
- [x] Test the pagination functionality

### Files to Edit:
- [x] TODO.md (Created)
- [x] frontend/src/components/StudentManagement/BatchStudentsView.jsx

### Expected Result:
- Student Management pagination should match Staff Management pagination style
- Numbered page buttons (1, 2, 3, 4, 5, ...)
- First/Last page navigation
- Proper page information display
- Responsive design
