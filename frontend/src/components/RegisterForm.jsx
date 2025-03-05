import React, { useState } from 'react';
import {
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Typography,
    Box,
    Switch,
    FormGroup,
    FormControlLabel,
    Select,
    MenuItem,
    Input,
    List,
    ListItem,
    ListItemText,
    Checkbox,
    ListItemSecondaryAction,
    IconButton,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 200,
    },
  },
};

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const RegisterForm = ({ formData, setFormData, role }) => {
    const handleInputChange = (e) => {
        const newForm = { ...formData, [e.target.name]: e.target.value }
        setFormData(newForm);
    };

    const [selectedDays, setSelectedDays] = useState([]);

    const handleDayToggle = (day) => {
        if(!day) return
        setSelectedDays(prevSelectedDays => {
            if (prevSelectedDays.includes(day)) {
                return prevSelectedDays.filter(d => d !== day);
            } else {
                return [...prevSelectedDays, day];
            }
        });
    };

    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const handleTimeChange = (newTime, setter) => {
        setter(newTime);
    };

    const updateAvailability = () => {
        if((startTime >= endTime) && startTime && endTime && selectedDays.length > 0){
            alert("Start time must be less then end time")
            setSelectedDays([]);
            return
        }
        else{

            let availabilityData = {};
            selectedDays.forEach(day => {
                availabilityData[day] = {
                    startTime: (startTime) ? startTime.format('HH:mm') : null,
                    endTime: (endTime) ? endTime.format('HH:mm') : null,
                };
            });
            setFormData({ ...formData, availability: JSON.stringify(availabilityData) });
        }
    };

            const validateForm = (formData) => {
                let errors = {};
            
                if (!formData.name || formData.name.trim() === '') {
                    return "Name is required";
                }
            
                if (!formData.email || formData.email.trim() === '') {
                    return "Email is required";
                } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                    return "Invalid email format";
                }
            
                if (!formData.password || formData.password.length < 6) {
                    return "Password must be at least 6 characters long";
                }
            
                if (role === 'consultant') {
                    if (!formData.bio || formData.bio.trim() === '') {
                        return "Bio is required";
                    }
            
                    if (!formData.qualification || formData.qualification.trim() === '') {
                        return "Qualification is required";
                    }
            
                    if (!formData.areasOfExpertise || formData.areasOfExpertise.trim() === '') {
                        return "Areas of Expertise are required";
                    }
            
                    if (!formData.speciality || formData.speciality.trim() === '') {
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
            
                if (role === 'user') {
                    if (!formData.bloodGroup || formData.bloodGroup.trim() === '') {
                        return "Blood Group is required";
                    }
            
                    if (!formData.medicalHistory || formData.medicalHistory.trim() === '') {
                        return "Medical History is required";
                    }
            
                    if (!formData.currentPrescriptions || formData.currentPrescriptions.trim() === '') {
                        return "Current Prescriptions are required";
                    }
                }
            
                return null;
            };

    React.useEffect(() => {
        updateAvailability();
    }, [startTime, endTime, selectedDays])

    return (
        <>
            {/* Basic Information */}
            <Grid container spacing={2}>

                {role === 'consultant' && (
                    <>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Bio"
                                name="bio"
                                multiline
                                rows={4}
                                value={formData.bio}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Qualification"
                                name="qualification"
                                value={formData.qualification}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Areas of Expertise"
                                name="areasOfExpertise"
                                value={formData.areasOfExpertise}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Speciality"
                                name="speciality"
                                value={formData.speciality}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Availability
                            </Grid>
                        <Grid item xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                 <TimePicker
                                      label="Start Time"
                                      value={startTime}
                                      onChange={(newTime) => handleTimeChange(newTime, setStartTime)}
                                       ampm={false}
                                       minutesStep={60}
                                       renderInput={(params) => <TextField {...params} fullWidth />}
                                  />
                            </LocalizationProvider>
                        </Grid>
                         <Grid item xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                 <TimePicker
                                      label="End Time"
                                      value={endTime}
                                      onChange={(newTime) => handleTimeChange(newTime, setEndTime)}
                                       ampm={false}
                                       minutesStep={60}
                                       renderInput={(params) => <TextField {...params} fullWidth />}
                                  />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} >
                             <Typography component="legend">Select Days</Typography>
                            <FormGroup row>
                                {daysOfWeek.map((day) => (
                                    <FormControlLabel
                                        key={day}
                                        control={<Switch checked={selectedDays.includes(day)} onChange={() => handleDayToggle(day)} name={day} />}
                                        label={day}
                                    />
                                ))}
                            </FormGroup>
                        </Grid>
                    </>
                )}
                {role === 'user' && (
                    <>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Blood Group"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Medical History"
                                name="medicalHistory"
                                multiline
                                rows={4}
                                value={formData.medicalHistory}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Current Prescriptions"
                                name="currentPrescriptions"
                                multiline
                                rows={4}
                                value={formData.currentPrescriptions}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </>
                )}
            </Grid>
        </>
    );
};

export default RegisterForm;