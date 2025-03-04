import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react'; // Assuming these are still used

// Material-UI Components
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Alert
} from '@mui/material';

import { registerUser } from '../utils/api';  // Keep the API call

// Define steps based on role
const getSteps = (role) => {
  if (role === 'consultant') {
    return ['Basic Information', 'Professional Details'];
  } else {
    return ['Basic Information', 'Medical Information'];
  }
};


const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());

  const [role, setRole] = useState('user');
  const steps = getSteps(role);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState(''); // Added Phone

  // Consultant Specific
  const [bio, setBio] = useState('');
  const [qualification, setQualification] = useState('');
  const [areasOfExpertise, setAreasOfExpertise] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [availability, setAvailability] = useState([]); // Placeholder for availability (needs custom component)
  const [accountVerificationStatus, setAccountVerificationStatus] = useState('pending'); // Simulate verification

  // User Specific
  const [bloodGroup, setBloodGroup] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [currentPrescriptions, setCurrentPrescriptions] = useState('');

  const [profilePicture, setProfilePicture] = useState(null); //Keep profile picture
  const [error, setError] = useState('');
  const navigate = useNavigate();



  // Validation States
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [bioError, setBioError] = useState('');
  const [qualificationError, setQualificationError] = useState('');
  const [areasOfExpertiseError, setAreasOfExpertiseError] = useState('');
  const [specialityError, setSpecialityError] = useState('');

  const [bloodGroupError, setBloodGroupError] = useState('');
  const [medicalHistoryError, setMedicalHistoryError] = useState('');


  const isStepOptional = (step) => {
    return false; // No steps are optional right now.
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    // Validate before proceeding to the next step
    if (!validateStep(activeStep)) {
      return; // Stop if validation fails
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against an unwanted condition.
      // Replace with your own logic.
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };


  const validateStep = (step) => {
    let isValid = true;
    switch (step) {
      case 0: // Basic Information
        if (!fullName) {
          setFullNameError('Full Name is required');
          isValid = false;
        } else {
          setFullNameError('');
        }

        if (!email) {
          setEmailError('Email is required');
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setEmailError('Invalid email format');
          isValid = false;
        } else {
          setEmailError('');
        }

        if (!password) {
          setPasswordError('Password is required');
          isValid = false;
        } else if (password.length < 6) {
          setPasswordError('Password must be at least 6 characters');
          isValid = false;
        } else {
          setPasswordError('');
        }

        if (!confirmPassword) {
          setConfirmPasswordError('Confirm Password is required');
          isValid = false;
        } else if (password !== confirmPassword) {
          setConfirmPasswordError('Passwords do not match');
          isValid = false;
        } else {
          setConfirmPasswordError('');
        }
        if (!phone) {
            setPhoneError('Phone is required');
            isValid = false;
          } else if (!/^\d+$/.test(phone)) {
            setPhoneError('Phone must contain only numbers');
            isValid = false;
          } else {
            setPhoneError('');
          }
        break;
      case 1: // Consultant Professional Details / User Medical Information
        if (role === 'consultant') {
          if (!bio) {
            setBioError('Bio is required');
            isValid = false;
          } else {
            setBioError('');
          }
           if (!qualification) {
              setQualificationError('Qualification is required');
              isValid = false;
            } else {
              setQualificationError('');
            }
             if (!areasOfExpertise) {
              setAreasOfExpertiseError('Areas of Expertise is required');
              isValid = false;
            } else {
              setAreasOfExpertiseError('');
            }
             if (!speciality) {
              setSpecialityError('Speciality is required');
              isValid = false;
            } else {
              setSpecialityError('');
            }
            //Availability can be empty
        } else { // User
           if (!bloodGroup) {
            setBloodGroupError('Blood Group is required');
            isValid = false;
          } else {
            setBloodGroupError('');
          }

          if (!medicalHistory) {
            setMedicalHistoryError('Medical History is required');
            isValid = false;
          } else {
            setMedicalHistoryError('');
          }

          //Current prescriptions can be empty
        }
        break;

      default:
        break;
    }
    return isValid;
  };


    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
  
      if (!validateStep(steps.length - 1)) { // Validate the last step as well
        return;
      }
  
  
      try {
        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phone', phone); // Add phone number
        formData.append('role', role);
  
        if (role === 'user') {
          formData.append('bloodGroup', bloodGroup || ''); // Handle potential null/undefined
          formData.append('medicalHistory', medicalHistory || '');
          formData.append('currentPrescriptions', currentPrescriptions || '');
        } else if (role === 'consultant') {
          formData.append('bio', bio || '');
          formData.append('qualification', qualification || '');
          formData.append('areasOfExpertise', areasOfExpertise || '');
          formData.append('speciality', speciality || '');
        }
        if (profilePicture) {
          formData.append('profilePicture', profilePicture);
        }
  
        for (const pair of formData.entries()) {
          console.log(pair[0] + ', ' + pair[1]);
        }
  
        await registerUser(formData);
        navigate('/login');
      } catch (err) {
        setError('Registration failed. Please try again.');
        console.error('Registration failed:', err);
      }
    };


  const getStepContent = (step) => {
    switch (step) {
      case 0: // Basic Information
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={!!fullNameError}
                helperText={fullNameError}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={!!phoneError}
                helperText={phoneError}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Registering as</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={role}
                  label="Registering as"
                  onChange={(e) => {
                    setRole(e.target.value);
                    setActiveStep(0); // Reset to the first step when changing role
                  }}
                >
                  <MenuItem value="user">Looking for a Consultant</MenuItem>
                  <MenuItem value="consultant">A Consultant</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                type="file"
                fullWidth
                label="Profile Picture"
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setProfilePicture(e.target.files[0])}
                />
            </Grid>
          </Grid>
        );

      case 1: // Consultant Professional Details / User Medical Information
        if (role === 'consultant') {
          return (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  error={!!bioError}
                  helperText={bioError}
                />
              </Grid>
               <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Qualification"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      error={!!qualificationError}
                      helperText={qualificationError}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Areas of Expertise"
                      value={areasOfExpertise}
                      onChange={(e) => setAreasOfExpertise(e.target.value)}
                      error={!!areasOfExpertiseError}
                      helperText={areasOfExpertiseError}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Speciality"
                      value={speciality}
                      onChange={(e) => setSpeciality(e.target.value)}
                      error={!!specialityError}
                      helperText={specialityError}
                    />
                  </Grid>
            </Grid>
          );
        } else {  // User
          return (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Blood Group"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  error={!!bloodGroupError}
                  helperText={bloodGroupError}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medical History"
                  multiline
                  rows={4}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  error={!!medicalHistoryError}
                  helperText={medicalHistoryError}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Prescriptions"
                  multiline
                  rows={4}
                  value={currentPrescriptions}
                  onChange={(e) => setCurrentPrescriptions(e.target.value)}
                />
              </Grid>
            </Grid>
          );
        }

      default:
        return 'Unknown step';
    }
  };


  return (
    <Box sx={{ width: '100%' }}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl w-full">
            <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
              Register
            </h2>

        {error && (
           <Alert severity="error">{error}</Alert>
        )}

      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <br/>
      {activeStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you're ready to register!
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Reset</Button>
             <Button onClick={handleSubmit}>Submit</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}

            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </Box>
        </React.Fragment>
      )}
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
           Already have an account? <a href="/login">Login</a>
        </Typography>
          </div>
        </div>
    </Box>
  );
};

export default Register;