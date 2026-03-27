import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ApplicationResponseContext = createContext();

export const useApplicationResponse = () => {
  const context = useContext(ApplicationResponseContext);
  if (!context) {
    throw new Error('useApplicationResponse must be used within ApplicationResponseProvider');
  }
  return context;
};

export const ApplicationResponseProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [pendingResponse, setPendingResponse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCheckingPending, setIsCheckingPending] = useState(false);
  const [isInitialCheckComplete, setIsInitialCheckComplete] = useState(false);
  const hasCheckedOnMount = useRef(false);

  // Check server for pending responses (MongoDB only)
  const checkForPendingResponses = useCallback(async () => {
    // Only students need to check for pending responses
    if (!user || user.role !== 'student') {
      setIsInitialCheckComplete(true);
      return;
    }

    if (isCheckingPending) {
      console.log('⚠️ Already checking for pending responses, skipping...');
      return;
    }

    setIsCheckingPending(true);

    try {
      console.log('🔍 Checking database for pending responses...');

      // Check server for any pending responses
      const response = await fetch('http://localhost:5001/api/v1/jobs/pending-responses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('pms_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data.pendingResponses.length > 0) {
          // Validate job data
          const validPendingResponses = data.data.pendingResponses.filter(
            pending => {
              // Check if job data exists and has valid ID
              return pending.job && pending.job._id && pending.job.title;
            }
          );

          if (validPendingResponses.length > 0) {
            // Show modal for the most recent pending response
            const mostRecent = validPendingResponses[0];
            console.log('✅ Found pending response in database, showing modal for job:', mostRecent.job._id);

            setPendingResponse({
              jobId: mostRecent.job._id,
              jobData: mostRecent.job,
              clickedAt: mostRecent.externalApplication.linkClickedAt
            });
            setShowModal(true);
          } else {
            console.log('⚠️ No valid pending responses found');
            setPendingResponse(null);
            setShowModal(false);
          }
        } else {
          console.log('✅ No pending responses in database');
          setPendingResponse(null);
          setShowModal(false);
        }
      } else {
        console.log('❌ Server pending responses check failed:', response.status);
      }
    } catch (err) {
      console.error('❌ Error checking for pending responses:', err);
    } finally {
      setIsCheckingPending(false);
      setIsInitialCheckComplete(true);
    }
  }, [isCheckingPending, user]);

  // Check for pending responses on mount and when user authenticates
  useEffect(() => {
    if (isAuthenticated && user?.role === 'student' && !hasCheckedOnMount.current) {
      hasCheckedOnMount.current = true;
      console.log('🔍 Checking for pending responses on mount...');
      checkForPendingResponses();
    }
  }, [isAuthenticated, user, checkForPendingResponses]);

  // Listen for window focus to check for pending responses
  useEffect(() => {
    const handleWindowFocus = () => {
      if (isAuthenticated && user?.role === 'student') {
        console.log('🔍 Window focused - checking for pending responses...');
        setTimeout(() => {
          checkForPendingResponses();
        }, 500);
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isAuthenticated, user, checkForPendingResponses]);

  // Record apply click (called when user clicks Apply Now)
  const recordApplyClick = async (jobId, jobData) => {
    try {
      console.log('🔗 Recording apply click for job:', jobId);

      // Show modal immediately to block UI before the server request completes
      // This prevents the user from closing the tab and bypassing the tracker
      setPendingResponse({
        jobId: jobId,
        jobData: jobData,
        clickedAt: new Date()
      });
      setShowModal(true);
      console.log('📱 Showing Application Confirmation Modal (Optimistic)');

      // Record click on server (MongoDB)
      const response = await fetch(`http://localhost:5001/api/v1/jobs/${jobId}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pms_token')}`
        }
      });

      if (response.ok) {
        console.log('✅ Apply click recorded in database');
      } else {
        console.error('❌ Failed to record apply click on server:', response.status);
        const errorText = await response.text();
        console.error('❌ Server error details:', errorText);
      }
    } catch (err) {
      console.error('❌ Error recording apply click:', err);
    }
  };

  // Submit response
  const submitResponse = async (responseData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('📤 Submitting response to database:', responseData);

      // Submit to server (MongoDB) - for both "Yes" and "No"
      const response = await fetch(`http://localhost:5001/api/v1/jobs/${responseData.jobId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pms_token')}`
        },
        body: JSON.stringify({
          applied: responseData.applied,
          notes: responseData.notes,
          responseMethod: 'forced' // Indicate this was a mandatory response
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear pending response and close modal
        setPendingResponse(null);
        setShowModal(false);

        console.log('✅ Response submitted successfully to database');
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to submit response');
      }
    } catch (err) {
      console.error('❌ Error submitting response:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Force check for pending responses (useful for testing or manual triggers)
  const forceCheck = () => {
    checkForPendingResponses();
  };

  // Clear current pending response (for testing purposes)
  const clearPendingResponse = () => {
    console.log('🧹 Clearing pending response');
    setPendingResponse(null);
    setShowModal(false);
  };

  // Check if user has already applied for a specific job
  const checkIfApplied = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/v1/jobs/${jobId}/response-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('pms_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.success && data.data.currentStatus === 'Applied';
      }
      return false;
    } catch (err) {
      console.error('Error checking if applied:', err);
      return false;
    }
  };

  const value = {
    pendingResponse,
    showModal,
    loading,
    error,
    recordApplyClick,
    submitResponse,
    forceCheck,
    clearPendingResponse,
    checkForPendingResponses,
    checkIfApplied,
    isInitialCheckComplete
  };

  return (
    <ApplicationResponseContext.Provider value={value}>
      {children}
    </ApplicationResponseContext.Provider>
  );
};

export default ApplicationResponseContext;
