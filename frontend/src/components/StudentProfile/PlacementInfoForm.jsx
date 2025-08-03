import React from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';

// @mui material components
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";

// @mui icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDButton from "../MDButton";

function PlacementInfoForm() {
  const {
    formData,
    updateFormData,
    saveProfile,
    isSaving,
    getFieldValue,
    hasFieldError,
    getFieldError,
    goToNextTab,
    goToPreviousTab,
    addArrayItem,
    removeArrayItem,
    updateArrayItem
  } = useStudentProfile();

  const handleInputChange = (field, value) => {
    updateFormData(field, value);
  };

  const handleSave = async () => {
    const result = await saveProfile();
    if (result.success) {
      goToNextTab();
    }
  };

  const placementStatusOptions = [
    'Unplaced',
    'Placed',
    'Multiple Offers'
  ];

  const handleAddOffer = () => {
    const newOffer = {
      companyName: '',
      ctc: '',
      joiningDate: '',
      jobRole: ''
    };
    addArrayItem('placement.offerDetails', newOffer);
  };

  const handleRemoveOffer = (index) => {
    removeArrayItem('placement.offerDetails', index);
  };

  const handleOfferChange = (index, field, value) => {
    const offers = getFieldValue('placement.offerDetails') || [];
    const updatedOffer = { ...offers[index], [field]: value };
    updateArrayItem('placement.offerDetails', index, updatedOffer);
  };

  const offerDetails = getFieldValue('placement.offerDetails') || [];

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Placement Information
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={2}>
          Provide details about your placement status and job offers
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        {/* Placement Status */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Placement Status"
            value={getFieldValue('placement.placementStatus') || 'Unplaced'}
            onChange={(e) => handleInputChange('placement.placementStatus', e.target.value)}
            fullWidth
          >
            {placementStatusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* Resume Headline */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="text"
            label="Resume Headline"
            value={getFieldValue('placement.resumeHeadline') || ''}
            onChange={(e) => handleInputChange('placement.resumeHeadline', e.target.value)}
            fullWidth
            placeholder="e.g., Computer Science Student seeking Software Developer role"
          />
        </Grid>

        {/* Offer Details Section */}
        {(getFieldValue('placement.placementStatus') === 'Placed' || 
          getFieldValue('placement.placementStatus') === 'Multiple Offers') && (
          <>
            <Grid item xs={12}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Job Offer Details
                </MDTypography>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddOffer}
                >
                  Add Offer
                </MDButton>
              </MDBox>
            </Grid>

            {offerDetails.map((offer, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDTypography variant="h6" fontWeight="medium">
                      Offer {index + 1}
                    </MDTypography>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleRemoveOffer(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </MDBox>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <MDInput
                        type="text"
                        label="Company Name"
                        value={offer.companyName || ''}
                        onChange={(e) => handleOfferChange(index, 'companyName', e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <MDInput
                        type="text"
                        label="CTC (Annual)"
                        value={offer.ctc || ''}
                        onChange={(e) => handleOfferChange(index, 'ctc', e.target.value)}
                        fullWidth
                        placeholder="e.g., 5 LPA, 8.5 LPA"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <MDInput
                        type="date"
                        label="Joining Date"
                        value={offer.joiningDate ? 
                          new Date(offer.joiningDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleOfferChange(index, 'joiningDate', e.target.value)}
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <MDInput
                        type="text"
                        label="Job Role"
                        value={offer.jobRole || ''}
                        onChange={(e) => handleOfferChange(index, 'jobRole', e.target.value)}
                        fullWidth
                        placeholder="e.g., Software Developer, Business Analyst"
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            ))}

            {offerDetails.length === 0 && (
              <Grid item xs={12}>
                <MDBox
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minHeight="100px"
                  border="2px dashed"
                  borderColor="grey.300"
                  borderRadius="lg"
                  bgcolor="grey.50"
                >
                  <MDBox textAlign="center">
                    <MDTypography variant="body2" color="text" mb={1}>
                      No job offers added yet
                    </MDTypography>
                    <MDButton
                      variant="outlined"
                      color="info"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddOffer}
                    >
                      Add Your First Offer
                    </MDButton>
                  </MDBox>
                </MDBox>
              </Grid>
            )}
          </>
        )}

        {/* Resume Information */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <MDTypography variant="h6" fontWeight="medium" mb={2}>
            Resume Information
          </MDTypography>
        </Grid>

        {/* Resume Last Updated */}
        {getFieldValue('placement.resumeLastUpdated') && (
          <Grid item xs={12} md={6}>
            <MDInput
              type="text"
              label="Resume Last Updated"
              value={new Date(getFieldValue('placement.resumeLastUpdated')).toLocaleDateString()}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
              sx={{
                '& .MuiInputBase-input': {
                  cursor: 'not-allowed',
                }
              }}
            />
          </Grid>
        )}

        {/* Resume Link Display */}
        {getFieldValue('placement.resumeLink') && (
          <Grid item xs={12} md={6}>
            <MDBox>
              <MDTypography variant="body2" fontWeight="medium" mb={1}>
                Current Resume
              </MDTypography>
              <MDButton
                variant="outlined"
                color="info"
                size="small"
                component="a"
                href={getFieldValue('placement.resumeLink')}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Resume
              </MDButton>
            </MDBox>
          </Grid>
        )}

        {/* Note about resume upload */}
        <Grid item xs={12}>
          <MDBox
            p={2}
            bgcolor="light.main"
            borderRadius="lg"
            sx={{ 
              border: '1px solid',
              borderColor: 'info.main',
              backgroundColor: 'rgba(26, 115, 232, 0.08)'
            }}
          >
            <MDTypography variant="body2" color="text" fontWeight="medium">
              Note: You can upload your resume in the "Resume Upload" tab.
            </MDTypography>
          </MDBox>
        </Grid>

        {/* Navigation Buttons */}
        <Grid item xs={12}>
          <MDBox mt={3} display="flex" justifyContent="space-between">
            <MDButton
              variant="outlined"
              color="info"
              onClick={goToPreviousTab}
            >
              Previous
            </MDButton>
            <MDButton
              variant="gradient"
              color="info"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save & Continue"}
            </MDButton>
          </MDBox>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default PlacementInfoForm;
