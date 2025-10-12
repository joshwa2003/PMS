import React from 'react';
import { OtherStaffProfileProvider } from '../../context/OtherStaffProfileContext';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';

function OtherStaffProfile() {
  return (
    <OtherStaffProfileProvider>
      {/* Profile Header */}
      <ProfileHeader />
      
      {/* Profile Tabs */}
      <ProfileTabs />
    </OtherStaffProfileProvider>
  );
}

export default OtherStaffProfile;
