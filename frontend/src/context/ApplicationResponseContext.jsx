import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const checkIntervalRef = useRef(null);
  const hasCheckedOnLoad = useRef(false);

  // Check for pending responses when user logs in or app loads
  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 User authenticated as student, checking for pending responses...');
      }
      checkForPendingResponses();
      hasCheckedOnLoad.current = true;
    }
  }, [isAuthenticated, user]);

  // Listen for window focus (when user returns from external site)
  useEffect(() => {
    const handleWindowFocus = () => {
      if (isAuthenticated && user?.role === 'student' && hasCheckedOnLoad.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Window focused, checking for pending responses...');
        }
        setTimeout(() => {
          checkForPendingResponses();
        }, 500); // Small delay to ensure page is fully loaded
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && user?.role === 'student' && hasCheckedOnLoad.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Page became visible, checking for pending responses...');
        }
        setTimeout(() => {
          checkForPendingResponses();
        }, 500);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, user]);

  // Periodic check for pending responses (fallback) - reduced frequency
  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      // Check every 30 seconds for pending responses (reduced from 5 seconds)
      checkIntervalRef.current = setInterval(() => {
        checkForPendingResponses();
      }, 30000);

      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
      };
    }
  }, [isAuthenticated, user]);

  // Check server for pending responses (MongoDB only)
  const checkForPendingResponses = async () => {
    try {
      // Only log in development mode to reduce console spam
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Checking for pending responses...');
      }
      
      // Check server for any pending responses
      const response = await fetch('http://localhost:5001/api/v1/jobs/pending-responses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('pms_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data.pendingResponses.length > 0) {
          // Show modal for the most recent pending response
          const mostRecent = data.data.pendingResponses[0];
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Found pending response, showing modal');
          }
          setPendingResponse({
            jobId: mostRecent.job._id,
            jobData: mostRecent.job,
            clickedAt: mostRecent.externalApplication.linkClickedAt
          });
          setShowModal(true);
        } else {
          setPendingResponse(null);
          setShowModal(false);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ Server pending responses check failed:', response.status);
        }
      }
    } catch (err) {
      console.error('❌ Error checking for pending responses:', err);
    }
  };

  // Record apply click (called when user clicks Apply Now)
  const recordApplyClick = async (jobId, jobData) => {
    try {
      console.log('🔗 Recording apply click for job:', jobId);
      
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
      console.log('📤 Submitting response:', responseData);
      
      // Submit to server (MongoDB)
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
        // Clear pending response
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

  const value = {
    pendingResponse,
    showModal,
    loading,
    error,
    recordApplyClick,
    submitResponse,
    forceCheck,
    clearPendingResponse,
    checkForPendingResponses
  };

  return (
    <ApplicationResponseContext.Provider value={value}>
      {children}
    </ApplicationResponseContext.Provider>
  );
};

export default ApplicationResponseContext;
