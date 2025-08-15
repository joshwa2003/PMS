# Fix ESLint Errors and Remove Department Selection from First Login

## Tasks to Complete:

### 1. Fix AuthContext.js ESLint Error
- [x] Remove `selectDepartment` reference from context value object (Line 264)
- [ ] Verify no other undefined references exist

### 2. Update FirstLoginPasswordReset.jsx
- [x] Remove department selection logic from success handler
- [x] Always redirect to dashboard after successful password reset
- [x] Remove references to `needsDepartmentSelection`

### 3. Verification
- [ ] Search for any remaining references to department selection in first login flow
- [ ] Test that ESLint errors are resolved
- [ ] Verify application builds without errors

## Status: In Progress
