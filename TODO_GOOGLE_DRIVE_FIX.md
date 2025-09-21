# Google Drive Image Display Fix - TODO

## Issue:
Google Drive links show images in job posts but not in user profiles due to GoogleDrivePreviewWrapper forcing iframe preview for all Google Drive links.

## Plan:
- [x] Fix GoogleDrivePreviewWrapper to allow direct image display for image files
- [ ] Improve image detection logic to identify image files from Google Drive URLs
- [ ] Test the fix to ensure images display properly in profiles
- [ ] Verify consistency between job posts and profiles

## Files to Edit:
- [x] `frontend/src/components/GoogleDrivePreviewWrapper.jsx` - Main fix
- [ ] `frontend/src/components/GoogleDrivePreview.jsx` - Minor improvements if needed

## Implementation Steps:
1. ✅ Modified GoogleDrivePreviewWrapper to detect image files
2. ✅ Allow direct image display for image files using backend proxy
3. ✅ Use iframe preview only for documents
4. [ ] Test the complete flow
