import React, { useState } from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CodeIcon from '@mui/icons-material/Code';
import LanguageIcon from '@mui/icons-material/Language';
import TranslateIcon from '@mui/icons-material/Translate';
import StarIcon from '@mui/icons-material/Star';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

// SAEC components
import MDBox from '../MDBox';
import MDTypography from '../MDTypography';
import MDAlert from '../MDAlert';

const Field = ({ label, value }) => (
  <MDBox mb={1.5}>
    <MDTypography variant="caption" color="text" fontWeight="medium">
      {label}
    </MDTypography>
    <MDTypography variant="body2">
      {value ?? '—'}
    </MDTypography>
  </MDBox>
);

const Section = ({ title, children, icon }) => (
  <Card sx={{ p: 2 }}>
    <MDBox display="flex" alignItems="center" mb={2}>
      {icon}
      <MDTypography variant="h6" fontWeight="medium" ml={1}>
        {title}
      </MDTypography>
    </MDBox>
    {children}
  </Card>
);

export default function ViewOnlyProfileTabs({ student }) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Basic Info', shortLabel: 'Basic', icon: <PersonIcon /> },
    { label: 'Contact Details', shortLabel: 'Contact', icon: <ContactPhoneIcon /> },
    { label: 'Academic Details', shortLabel: 'Academic', icon: <SchoolIcon /> },
    { label: 'Career Profile', shortLabel: 'Career', icon: <WorkIcon /> },
    { label: 'Placement Info', shortLabel: 'Placement', icon: <BusinessCenterIcon /> },
    { label: 'Skills & Certifications', shortLabel: 'Skills', icon: <EmojiEventsIcon /> },
    { label: 'Projects & Internships', shortLabel: 'Projects', icon: <CodeIcon /> },
    { label: 'Online Profiles', shortLabel: 'Online', icon: <LanguageIcon /> },
    { label: 'Language Proficiency', shortLabel: 'Languages', icon: <TranslateIcon /> },
    { label: 'Accomplishments', shortLabel: 'Awards', icon: <StarIcon /> },
    { label: 'Profile Summary', shortLabel: 'Summary', icon: <DescriptionIcon /> },
    { label: 'Resume Upload', shortLabel: 'Resume', icon: <CloudUploadIcon /> },
  ];

  const navPrev = () => setActiveTab((t) => (t > 0 ? t - 1 : t));
  const navNext = () => setActiveTab((t) => (t < tabs.length - 1 ? t + 1 : t));

  const s = student || {};
  const personal = s.personalInfo || {};
  const contact = s.contact || {};
  const academic = s.academic || {};
  const placement = s.placement || {};
  const career = s.careerProfile || {};
  const skills = s.skillsCertifications || [];
  const projects = s.projects || [];
  const internships = s.internships || [];
  const online = s.onlineProfiles || [];
  const languages = s.languagesKnown || [];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Section title="Basic Info" icon={<PersonIcon color="info" />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field label="Full Name" value={personal.fullName} />
                <Field label="Student ID" value={s.studentId} />
                <Field label="Registration Number" value={s.registrationNumber} />
                <Field label="Date of Birth" value={personal.dateOfBirth} />
                <Field label="Gender" value={personal.gender} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field label="Nationality" value={personal.nationality} />
                <Field label="Category" value={personal.category} />
                <Field label="Marital Status" value={personal.maritalStatus} />
                <Field label="Differently Abled" value={personal.differentlyAbled ? 'Yes' : 'No'} />
                <Field label="Career Break" value={personal.careerBreak ? 'Yes' : 'No'} />
              </Grid>
            </Grid>
          </Section>
        );
      case 1:
        return (
          <Section title="Contact Details" icon={<ContactPhoneIcon color="info" />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field label="Email" value={contact.email} />
                <Field label="Phone" value={contact.phone} />
                <Field label="Guardian Name" value={contact.guardianName} />
                <Field label="Guardian Contact" value={contact.guardianContact} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field label="Permanent Address" value={contact.permanentAddress} />
                <Field label="Current Address" value={contact.currentAddress} />
                <Field label="Hometown" value={contact.hometown} />
                <Field label="Pincode" value={contact.pincode} />
              </Grid>
            </Grid>
          </Section>
        );
      case 2:
        return (
          <Section title="Academic Details" icon={<SchoolIcon color="info" />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field label="Department" value={academic.department} />
                <Field label="Program" value={academic.program} />
                <Field label="Specialization" value={academic.specialization} />
                <Field label="Course Type" value={academic.courseType} />
                <Field label="University" value={academic.university} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field label="Course Duration From" value={academic.courseDurationFrom} />
                <Field label="Course Duration To" value={academic.courseDurationTo} />
                <Field label="Grading System" value={academic.gradingSystem} />
                <Field label="CGPA" value={academic.cgpa} />
                <Field label="Backlogs" value={academic.backlogs} />
                <Field label="Year Of Study" value={academic.yearOfStudy} />
                <Field label="Current Semester" value={academic.currentSemester} />
                <Field label="Section" value={academic.section} />
              </Grid>
            </Grid>
          </Section>
        );
      case 3:
        return (
          <Section title="Career Profile" icon={<WorkIcon color="info" />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field label="Current Industry" value={career.currentIndustry} />
                <Field label="Department" value={career.department} />
                <Field label="Desired Job Type" value={career.desiredJobType} />
                <Field label="Employment Type" value={career.desiredEmploymentType} />
                <Field label="Preferred Shift" value={career.preferredShift} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field label="Preferred Locations" value={(career.preferredLocations || []).join(', ')} />
              </Grid>
            </Grid>
          </Section>
        );
      case 4:
        return (
          <Section title="Placement Info" icon={<BusinessCenterIcon color="info" />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field label="Placement Status" value={placement.placementStatus} />
                <Field label="Resume Headline" value={placement.resumeHeadline} />
                <Field label="Resume Link" value={placement.resumeLink} />
              </Grid>
              <Grid item xs={12} md={6}>
                {(placement.offerDetails || []).map((offer, idx) => (
                  <MDBox key={idx} mb={1.5}>
                    <MDTypography variant="button" fontWeight="medium">Offer {idx + 1}</MDTypography>
                    <Field label="Company" value={offer.companyName} />
                    <Field label="CTC" value={offer.ctc} />
                    <Field label="Job Role" value={offer.jobRole} />
                  </MDBox>
                ))}
                {(!placement.offerDetails || placement.offerDetails.length === 0) && (
                  <MDTypography variant="body2" color="text">No offers recorded</MDTypography>
                )}
              </Grid>
            </Grid>
          </Section>
        );
      case 5:
        return (
          <Section title="Skills & Certifications" icon={<EmojiEventsIcon color="info" />}>
            {(skills || []).length > 0 ? (
              <Grid container spacing={2}>
                {(skills || []).map((item, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Field label="Skill/Certification" value={item?.name || item} />
                    {item?.level && <Field label="Level" value={item.level} />}
                    {item?.issuedBy && <Field label="Issued By" value={item.issuedBy} />}
                  </Grid>
                ))}
              </Grid>
            ) : (
              <MDTypography variant="body2" color="text">No skills or certifications</MDTypography>
            )}
          </Section>
        );
      case 6:
        return (
          <Section title="Projects & Internships" icon={<CodeIcon color="info" />}>
            <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>Projects</MDTypography>
            {(projects || []).length > 0 ? (
              (projects || []).map((proj, idx) => (
                <MDBox key={idx} mb={1.5}>
                  <Field label="Title" value={proj.title} />
                  <Field label="Description" value={proj.description} />
                  <Field label="Technologies" value={(proj.technologies || []).join(', ')} />
                </MDBox>
              ))
            ) : (
              <MDTypography variant="body2" color="text">No projects</MDTypography>
            )}
            <Divider sx={{ my: 2 }} />
            <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>Internships</MDTypography>
            {(internships || []).length > 0 ? (
              (internships || []).map((intern, idx) => (
                <MDBox key={idx} mb={1.5}>
                  <Field label="Company" value={intern.company} />
                  <Field label="Role" value={intern.role} />
                  <Field label="Duration" value={intern.duration} />
                </MDBox>
              ))
            ) : (
              <MDTypography variant="body2" color="text">No internships</MDTypography>
            )}
          </Section>
        );
      case 7:
        return (
          <Section title="Online Profiles" icon={<LanguageIcon color="info" />}>
            {(online || []).length > 0 ? (
              (online || []).map((p, idx) => (
                <Field key={idx} label={p.platform || 'Profile'} value={p.url} />
              ))
            ) : (
              <MDTypography variant="body2" color="text">No online profiles</MDTypography>
            )}
          </Section>
        );
      case 8:
        return (
          <Section title="Language Proficiency" icon={<TranslateIcon color="info" />}>
            {(languages || []).length > 0 ? (
              (languages || []).map((lang, idx) => (
                <MDBox key={idx} mb={1.5}>
                  <Field label="Language" value={lang.language} />
                  <Field label="Proficiency" value={lang.proficiency} />
                </MDBox>
              ))
            ) : (
              <MDTypography variant="body2" color="text">No languages added</MDTypography>
            )}
          </Section>
        );
      case 9:
        return (
          <Section title="Accomplishments" icon={<StarIcon color="info" />}>
            {(s.accomplishments || []).length > 0 ? (
              (s.accomplishments || []).map((acc, idx) => (
                <MDBox key={idx} mb={1.5}>
                  <Field label="Title" value={acc.title} />
                  <Field label="Description" value={acc.description} />
                  <Field label="Date" value={acc.date} />
                </MDBox>
              ))
            ) : (
              <MDTypography variant="body2" color="text">No accomplishments</MDTypography>
            )}
          </Section>
        );
      case 10:
        return (
          <Section title="Profile Summary" icon={<DescriptionIcon color="info" />}>
            <MDTypography variant="body2">{s.profileSummary || '—'}</MDTypography>
          </Section>
        );
      case 11:
        return (
          <Section title="Resume" icon={<CloudUploadIcon color="info" />}>
            <Field label="Resume Link" value={placement.resumeLink || s.resume?.url} />
          </Section>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <MDBox p={2}>
        <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <MDBox display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {tabs.map((t, idx) => (
              <Tooltip key={t.label} title={t.label} placement="top">
                <IconButton
                  color={activeTab === idx ? 'info' : 'default'}
                  onClick={() => setActiveTab(idx)}
                  size="small"
                >
                  {t.icon}
                </IconButton>
              </Tooltip>
            ))}
          </MDBox>
          <MDBox>
            <Tooltip title="Previous">
              <span>
                <IconButton onClick={navPrev} disabled={activeTab === 0} size="small">
                  <NavigateBeforeIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Next">
              <span>
                <IconButton onClick={navNext} disabled={activeTab === tabs.length - 1} size="small">
                  <NavigateNextIcon />
                </IconButton>
              </span>
            </Tooltip>
          </MDBox>
        </MDBox>
        {(!student) && (
          <MDAlert color="warning" dismissible>
            Student data not available.
          </MDAlert>
        )}
        {renderTabContent()}
      </MDBox>
      <Divider />
      <MDBox p={1.5} display="flex" justifyContent="space-between" alignItems="center">
        <MDTypography variant="caption" color="text">
          Tab {activeTab + 1} of {tabs.length}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          View Only
        </MDTypography>
      </MDBox>
    </Card>
  );
}