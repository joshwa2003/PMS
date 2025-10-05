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
  const waitingForReturn = useRef(false); // Track if we're waiting for student to return from external site
  
  // Track jobs that were recently responded to with localStorage persistence
  const getRecentlyRespondedJobs = () => {
    try {
      const stored = localStorage.getItem('recently_responded_jobs');
      if (!stored) return new Map();
      const parsed = JSON.parse(stored);
      // Filter out expired entries (older than 10 seconds)
      const now = Date.now();
      const filtered = Object.entries(parsed).filter(([_, timestamp]) => now - timestamp < 10000);
      return new Map(filtered);
    } catch {
      return new Map();
    }
  };
  
  const setRecentlyRespondedJob = (jobId) => {
    try {
      const current = getRecentlyRespondedJobs();
      current.set(jobId, Date.now());
      localStorage.setItem('recently_responded_jobs', JSON.stringify(Object.fromEntries(current)));
    } catch (err) {
      console.error('Error saving recently responded job:', err);
    }
  };

  // Listen for window focus ONLY when waiting for student to return from external site
  useEffect(() => {
    const handleWindowFocus = () => {
      if (waitingForReturn.current && isAuthenticated && user?.role === 'student') {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Student returned from external site, checking for pending responses...');
        }
        waitingForReturn.current = false; // Reset flag
        setTimeout(() => {
          checkForPendingResponses();
        }, 1000); // Delay to ensure they actually returned
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Check server for pending responses (MongoDB only)
  const checkForPendingResponses = async () => {
    // ONLY check if we're explicitly waiting for the student to return
    if (!waitingForReturn.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Not waiting for student return, skipping check');
      }
      return;
    }
    
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
          // Filter out jobs that were recently responded to and validate job data
          const recentlyResponded = getRecentlyRespondedJobs();
          const validPendingResponses = data.data.pendingResponses.filter(
            pending => {
              // Check if job data exists and has valid ID
              const hasValidJob = pending.job && pending.job._id && pending.job.title;
              const notRecentlyResponded = !recentlyResponded.has(pending.job?._id);
              return hasValidJob && notRecentlyResponded;
            }
          );
          
          if (validPendingResponses.length > 0) {
            // Show modal for the most recent pending response
            const mostRecent = validPendingResponses[0];
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ Found pending response, showing modal for job:', mostRecent.job._id);
            }
            setPendingResponse({
              jobId: mostRecent.job._id,
              jobData: mostRecent.job,
              clickedAt: mostRecent.externalApplication.linkClickedAt
            });
            setShowModal(true);
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.log('⚠️ No valid pending responses found (filtered out invalid or recently responded)');
            }
            setPendingResponse(null);
            setShowModal(false);
          }
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
        
        // Show modal immediately after recording the click
        setPendingResponse({
          jobData: jobData,
          clickedAt: new Date()
        });
        setShowModal(true);
        
        console.log('📱 Showing Application Confirmation Modal');
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
      // If skipSave is true (student clicked "No"), just close modal without saving
      if (responseData.skipSave) {
        console.log('🚫 Skipping save - student clicked "No, I Didn\'t Apply"');
        
        // Add to cooldown for 10 seconds to prevent immediate re-showing (persisted in localStorage)
        setRecentlyRespondedJob(responseData.jobId);
        
        // Clear pending response and close modal
        setPendingResponse(null);
        setShowModal(false);
        setLoading(false);
        
        return { success: true, skipped: true };
      }
      
      console.log('📤 Submitting response:', responseData);
      
      // Submit to server (MongoDB) - only for "Yes, I Applied"
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
        // Add job to recently responded list (persisted in localStorage)
        setRecentlyRespondedJob(responseData.jobId);
        
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
    checkIfApplied
  };

  return (
    <ApplicationResponseContext.Provider value={value}>
      {children}
    </ApplicationResponseContext.Provider>
  );
};

export default ApplicationResponseContext;
