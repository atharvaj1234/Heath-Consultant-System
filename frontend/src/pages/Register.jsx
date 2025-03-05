import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";

// Material-UI Components
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

import RegisterForm from "../components/RegisterForm";

import { registerUser } from "../utils/api";

const getSteps = (role) => {
  if (role === "consultant") {
    return ["Basic Information", "Professional Details"];
  } else {
    return ["Basic Information", "Medical Information"];
  }
};

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());

  const [role, setRole] = useState("user");
  const steps = getSteps(role);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    bio: "",
    qualification: "",
    areasOfExpertise: "",
    speciality: "",
    availability: "",
    bloodGroup: "",
    medicalHistory: "",
    currentPrescriptions: "",
    profilePicture: null,
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isStepOptional = (step) => {
    return false; // No steps are optional right now.
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const validateForm = (step) => {
    let errors = {};

    if (!formData.fullName || formData.fullName.trim() === "") {
      return "Name is required";
    }

    if (!formData.email || formData.email.trim() === "") {
      return "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return "Invalid email format";
    }

    if (!formData.phone || formData.phone.trim() === "") {
      return "Phone no. is required";
    } else if (
      !/^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
        formData.phone
      )
    ) {
      return "Invalid phone no.";
    }

    if (!formData.password || formData.password.length < 6) {
      return "Password must be at least 6 characters long";
    }

    if (formData.password != formData.confirmPassword) {
      return "Password must be at least 6 characters long";
    }

    if (role === "consultant" && step) {
      if (!formData.bio || formData.bio.trim() === "") {
        return "Bio is required";
      }

      if (!formData.qualification || formData.qualification.trim() === "") {
        return "Qualification is required";
      }

      if (
        !formData.areasOfExpertise ||
        formData.areasOfExpertise.trim() === ""
      ) {
        return "Areas of Expertise are required";
      }

      if (!formData.speciality || formData.speciality.trim() === "") {
        return "Speciality is required";
      }

      try {
        const availability = JSON.parse(formData.availability);
        if (Object.keys(availability).length === 0) {
          return "At least one availability slot must be selected";
        }
      } catch {
        errors.availability = "Invalid availability format";
      }
    }

    if (role === "user" && step) {
      if (!formData.bloodGroup || formData.bloodGroup.trim() === "") {
        return "Blood Group is required";
      }

      if (!formData.medicalHistory || formData.medicalHistory.trim() === "") {
        return "Medical History is required";
      }

      if (
        !formData.currentPrescriptions ||
        formData.currentPrescriptions.trim() === ""
      ) {
        return "Current Prescriptions are required";
      }
    }

    return null;
  };

  const handleNext = () => {
    setError("");
    114;

    var err;
    if (activeStep == steps.length - 1) {
      err = validateForm(1);
    } else err = validateForm();
    if (err) {
      setError(err);
      return;
    }
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      formDataToSend.append("role", role);

      await registerUser(formDataToSend);
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error("Registration failed:", err);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0: // Basic Information and Role Selection
        return (
          <Grid container spacing={2}>
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
                    setFormData((prev) => ({ ...prev })); // Reset to the first step when changing role
                  }}
                >
                  <MenuItem value="user">Looking for a Consultant</MenuItem>
                  <MenuItem value="consultant">A Consultant</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </Grid>
            <Grid
              item
              xs={12}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              Profile Picture
              <TextField
                type="file"
                label="Profile Picture"
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profilePicture: e.target.files[0],
                  })
                }
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <RegisterForm
            formData={formData}
            setFormData={setFormData}
            role={role}
          />
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl w-full">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
            Register
          </h2>

          {error && <Alert severity="error">{error}</Alert>}

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
          <br />
          {activeStep === steps.length ? (
            <React.Fragment>
              <Typography sx={{ mt: 2, mb: 1 }}>
                All steps completed - you're ready to register!
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button onClick={handleReset}>Reset</Button>
                <Button onClick={handleSubmit}>Submit</Button>
              </Box>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {getStepContent(activeStep)}
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: "1 1 auto" }} />
                {isStepOptional(activeStep) && (
                  <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                    Skip
                  </Button>
                )}

                <Button onClick={handleNext}>
                  {activeStep === steps.length - 1 ? "Submit" : "Next"}
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
