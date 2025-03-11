import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultantById, requestApointment, getConsultantBookingsById } from '../utils/api';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import { styled } from '@mui/system';
import {
    Container,
    Typography,
    Grid,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Box,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Paper,
    Stack,
} from '@mui/material';
import { CreditCard, Calendar, Clock, CheckCircle, User, Phone, Mail } from 'lucide-react';
// import backgroundImage from 'http://placehold.co/400x400'; // Import background image
import Swal from 'sweetalert2'

// 🌈 Styled Components with Glassmorphism & Gradients
const PageContainer = styled(Container)({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    // backgroundImage: `url())`, // Set background image
    backgroundSize: 'cover', // Cover entire area
    backgroundPosition: 'center', // Center the image
    '&::before': { // Overlay for darkening the background
        minidth: '100%',
        height: '100%',
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Darken the background
        zIndex: -1,
    },
    position: 'relative',
    zIndex: 1, // Ensure content is above overlay
});

const GlassCard = styled(Card)({
    background: 'linear-gradient(45deg,rgb(107, 122, 254) 30%,rgb(255, 83, 252) 90%)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '32px',
    color: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '900px',  // Limit card width
    width: '100%',
    zIndex: 2, // Ensure card is above overlay
});

const GradientButton = styled(Button)({
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    color: '#fff',
    padding: '12px 30px',
    fontWeight: 'bold',
    textTransform: 'none',
    borderRadius: '25px',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'scale(1.05)',
        background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
    },
});

const StyledTextField = styled(TextField)({
    '& label.Mui-focused': { color: '#fff' },
    '& .MuiOutlinedInput-root': {
        color: '#fff',
        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
        '&:hover fieldset': { borderColor: '#FF8E53' },
        '&.Mui-focused fieldset': { borderColor: '#FE6B8B' },
    },
    '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.7)',
    },
});

const ConsultantInfoBox = styled(Paper)({
    padding: '16px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    marginBottom: '20px',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    textWrap: 'wrap'
});

const Booking = () => {
    const { id } = useParams();
    const [consultant, setConsultant] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [time, setTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [reasonForAppointment, setReasonForAppointment] = useState('');
    const navigate = useNavigate();
    const [availableTimes, setAvailableTimes] = useState({}); // dynamic times
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchConsultant = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getConsultantById(id);
                setConsultant(data);
            } catch (err) {
                setError('Failed to retrieve consultant details. Please try again.');
                setConsultant(null);
                console.error('Failed to fetch consultant:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchConsultant();
    }, [id]);

    useEffect(() => {
        const fetchConsultantAvailability = async () => {
            try {
                const token = localStorage.getItem('token');
                const data = await getConsultantBookingsById(token, id);
                setBookings(data);
                console.log(data)

                const response = await fetch(
                    `http://localhost:5555/api/consultant/${id}/availability`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data_available = await response.json();
                setAvailableTimes(data_available);
                console.log("Available Times:", data_available);  // CHECKPOINT
            } catch (parseError) {
                setError("Failed to load data from the server");
                console.error(parseError);
            }
        };
        fetchConsultantAvailability();
    }, [id, selectedDate]);

    const isSlotBooked = (appointments, selectedDate, selectedTime) => appointments.some(app => app.date === selectedDate && app.time === selectedTime && (app.status == "accepted" || app.status == "pending"));

    const handleSubmit = async (e) => {
        console.log(bookings)
        e.preventDefault();
        setLoading(true);
        setError('');
        setBookingSuccess(false);
        if (isSlotBooked(bookings, selectedDate.format('YYYY-MM-DD'), time) || selectedDate === new Date().toISOString().split('T')[0]) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Time slot already booked select another!',
            })
            setLoading(false);
            return
        }


        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required. Please login.');
                return;
            }

            await requestApointment(token, id, selectedDate.format('YYYY-MM-DD'), time, reasonForAppointment, additionalNotes);
            setBookingSuccess(true);
            Swal.fire({
                icon: 'success',
                title: 'Booking Confirmed!',
                text: 'Redirecting to your dashboard...',
                timer: 3000,
                showConfirmButton: false
            }).then(() => {
                navigate('/consultationdashboard');
            });
        } catch (err) {
            setError('Failed to create booking. Please try again.');
            console.error('Booking creation failed:', err);
        } finally {
            setLoading(false);
        }
    };


    const generateTimeSlots = () => {
        if (!consultant || !availableTimes) return [];

        const bookingDay = selectedDate.format('dddd'); // Get full day name (e.g., "Monday")
        console.log("Booking Day:", bookingDay);

        if (!availableTimes[bookingDay]) {
            console.log("No availability for this day.");
            return [];
        }

        const { startTime, endTime } = availableTimes[bookingDay];
        if (!startTime || !endTime) {
            console.log("Invalid time range.");
            return [];
        }

        // Create proper dayjs objects with date and time
        const start = dayjs(`${selectedDate.format('YYYY-MM-DD')} ${startTime}`, "YYYY-MM-DD HH:mm");
        const end = dayjs(`${selectedDate.format('YYYY-MM-DD')} ${endTime}`, "YYYY-MM-DD HH:mm");

        if (!start.isValid() || !end.isValid()) {
            console.log("Invalid dayjs objects for time parsing.");
            return [];
        }

        let currentTime = start;
        const timeSlots = [];

        while (currentTime.isBefore(end)) {
            const slotStart = currentTime.format('HH:mm');
            currentTime = currentTime.add(1, 'hour'); // Increment by 1 hour
            const slotEnd = currentTime.format('HH:mm');

            if (currentTime.isAfter(end)) break; // Prevent adding a slot that exceeds the end time

            timeSlots.push(`${slotStart}-${slotEnd}`);
        }

        console.log("Generated Time Slots:", timeSlots);

        const newTimeSlots = timeSlots.filter(
            (slot) => !bookings.some(app => app.time === slot)
        );
        return newTimeSlots;
    };


    if (loading) {
        return <PageContainer><CircularProgress /></PageContainer>;
    }

    if (error) {
        return <PageContainer><Alert severity="error">{error}</Alert></PageContainer>;
    }

    return (
        <PageContainer>
            <GlassCard>
                <Grid container spacing={4}>
                    {/* Consultant Information */}
                    <Grid item xs={12} md={4}>
                        <ConsultantInfoBox>
                            <Stack direction="column" alignItems="center" spacing={2}>
                                <Avatar
                                    alt={consultant?.consultant?.fullName}
                                    src={`http://localhost:5555/${consultant?.consultant?.profilePicture}`}
                                    sx={{ width: 80, height: 80, mb: 1 }}
                                />
                                <Typography variant="h6" align="center" fontWeight="bold">
                                    Dr. {consultant?.consultant?.fullName}
                                </Typography>
                                <Typography variant="body2" align="center" color="textSecondary">
                                    {consultant?.consultant?.speciality}
                                </Typography>
                                <Typography variant="body2" align="center" color="textSecondary">
                                    {consultant?.consultant?.areasOfExpertise}
                                </Typography>
                            </Stack>
                            <List>
                                <ListItem>
                                    <User color="white" size={16} style={{ marginRight: 8 }} />
                                    <ListItemText primary={consultant?.consultant?.fullName} />
                                </ListItem>
                                <ListItem>
                                    <Phone color="white" size={16} style={{ marginRight: 8 }} />
                                    <ListItemText primary={consultant?.consultant?.phone} />
                                </ListItem>
                                <ListItem>
                                    <Mail color="white" size={16} style={{ marginRight: 8 }} />
                                    <ListItemText primary={consultant?.consultant?.email} />
                                </ListItem>
                            </List>
                        </ConsultantInfoBox>
                    </Grid>

                    {/* Booking Form */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
                            Request Appointment
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <StyledTextField
                                label="Select Date"
                                type="date"
                                fullWidth
                                required
                                value={selectedDate.format('YYYY-MM-DD')}
                                onChange={(e) => setSelectedDate(dayjs(e.target.value))}
                                InputLabelProps={{ shrink: true }}
                                sx={{ mb: 2 }}
                            />

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel style={{ color: '#fff' }}>Select Time Slot</InputLabel>
                                <Select
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    style={{ color: '#fff' }}
                                >
                                    {generateTimeSlots().map((slot) => (
                                        <MenuItem key={slot} value={slot}>
                                            {slot}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <StyledTextField
                                label="Reason for Appointment"
                                fullWidth
                                multiline
                                rows={3}
                                value={reasonForAppointment}
                                onChange={(e) => setReasonForAppointment(e.target.value)}
                                sx={{ mb: 2 }}
                                placeholder="Briefly describe your reason for booking this appointment"
                            />

                            <StyledTextField
                                label="Additional Notes (Optional)"
                                fullWidth
                                multiline
                                rows={3}
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                sx={{ mb: 3 }}
                                placeholder="Any additional information you'd like to share?"
                            />

                            <GradientButton type="submit" fullWidth startIcon={<CheckCircle />}>
                                Request Appointment
                            </GradientButton>


                        </form>
                    </Grid>
                </Grid>
            </GlassCard>
        </PageContainer>
    );
};

export default Booking;