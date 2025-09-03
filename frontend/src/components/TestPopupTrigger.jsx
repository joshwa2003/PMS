import React from 'react';
import { useApplicationResponse } from 'context/ApplicationResponseContext';
import MDButton from 'components/MDButton';
import MDBox from 'components/MDBox';

const TestPopupTrigger = () => {
  const { recordApplyClick, checkForPendingResponses, showModal, pendingResponse } = useApplicationResponse();

  const handleTestClick = async () => {
    console.log('🧪 Testing popup trigger...');
    
    // Simulate apply click data
    const testJobData = {
      _id: 'test-job-123',
      title: 'Test Software Engineer Position',
      company: { name: 'Test Company Inc.' },
      location: 'Remote'
    };

    // Record the apply click
    await recordApplyClick('test-job-123', testJobData);
    
    // Force check for pending responses
    setTimeout(() => {
      checkForPendingResponses();
    }, 1000);
  };

  const handleForceCheck = () => {
    console.log('🔍 Force checking for pending responses...');
    checkForPendingResponses();
  };

  const handleAddToStorage = () => {
    console.log('📦 Adding test data to storage...');
    const pendingData = {
      jobId: 'test-job-123',
      jobData: {
        _id: 'test-job-123',
        title: 'Test Software Engineer Position',
        company: { name: 'Test Company Inc.' },
        location: 'Remote'
      },
      clickedAt: new Date().toISOString()
    };
    
    localStorage.setItem('pendingApplicationResponse', JSON.stringify(pendingData));
    sessionStorage.setItem('pendingApplicationResponse', JSON.stringify(pendingData));
    
    // Force check after adding data
    setTimeout(() => {
      checkForPendingResponses();
    }, 500);
  };

  return (
    <MDBox p={3} sx={{ position: 'fixed', top: 10, right: 10, zIndex: 1000, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: 2 }}>
      <MDBox mb={2}>
        <strong>Popup Test Controls</strong>
      </MDBox>
      <MDBox mb={1}>
        <MDButton variant="contained" color="primary" onClick={handleTestClick} size="small">
          Test Apply Click
        </MDButton>
      </MDBox>
      <MDBox mb={1}>
        <MDButton variant="contained" color="secondary" onClick={handleForceCheck} size="small">
          Force Check
        </MDButton>
      </MDBox>
      <MDBox mb={1}>
        <MDButton variant="contained" color="success" onClick={handleAddToStorage} size="small">
          Add Test Data
        </MDButton>
      </MDBox>
      <MDBox mt={2} sx={{ fontSize: '12px' }}>
        <div>Modal Showing: {showModal ? 'YES' : 'NO'}</div>
        <div>Pending Response: {pendingResponse ? 'YES' : 'NO'}</div>
      </MDBox>
    </MDBox>
  );
};

export default TestPopupTrigger;
