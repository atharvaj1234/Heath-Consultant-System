import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultantById, createBooking, getConsultantBookingsById } from '../utils/api';
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
} from '@mui/material';
import { CreditCard, Calendar, Clock, CheckCircle } from 'lucide-react';

// 🌈 Styled Components with Glassmorphism & Gradients
const PageContainer = styled(Container)({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '',
    padding: '20px',
});

const GlassCard = styled(Card)({
    background: 'linear-gradient(135deg,rgba(93, 165, 247, 0.63) 0%,rgba(102, 37, 252, 0.67) 100%)',
    backdropFilter: 'blur(12px)',
    borderRadius: '16px',
    padding: '24px',
    color: '#fff',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
});

const GradientButton = styled(Button)({
    background: 'linear-gradient(135deg, #6a11cb 30%, #2575fc 90%)',
    color: '#fff',
    padding: '10px 20px',
    fontWeight: 'bold',
    textTransform: 'none',
    transition: 'all 0.3s ease-in-out',
    borderRadius: '8px',
    '&:hover': {
        background: 'linear-gradient(135deg, #2575fc 30%, #6a11cb 90%)',
        transform: 'scale(1.05)',
    },
});

// Custom Input Styling
const StyledTextField = styled(TextField)({
    '& label.Mui-focused': { color: '#fff' },
    '& .MuiOutlinedInput-root': {
        color: '#fff',
        '& fieldset': { borderColor: '#ddd' },
        '&:hover fieldset': { borderColor: '#6a11cb' },
        '&.Mui-focused fieldset': { borderColor: '#2575fc' },
    },
});

// 🔥 Booking Component
const Booking = () => {
    const { id } = useParams();
    const [consultant, setConsultant] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [time, setTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
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

  const isSlotBooked = (appointments, selectedDate, selectedTime) => appointments.some(app => app.date === selectedDate && app.time === selectedTime);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setBookingSuccess(false);
        if(isSlotBooked(bookings, selectedDate.format('YYYY-MM-DD'), time) || selectedDate === new Date().toISOString().split('T')[0]){
            alert("Slot Already Booked Select another")
            setLoading(false);
            return
        }


        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required. Please login.');
                return;
            }

            await createBooking(token, id, selectedDate.format('YYYY-MM-DD'), time);
            setBookingSuccess(true);
            setTimeout(() => {
                navigate('/consultationdashboard');
            }, 2000);
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
      return timeSlots;
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
                <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
                    Book Appointment with {consultant?.consultant?.speciality}
                </Typography>

                <Grid container spacing={3}>
                    {/* Booking Form */}
                    <Grid item xs={12} md={6}>
                        <form onSubmit={handleSubmit}>
                            <Typography variant="h6" gutterBottom>Booking Details</Typography>

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

                            <Typography variant="h6" gutterBottom>Payment Details</Typography>

                            <StyledTextField label="Card Number" fullWidth required sx={{ mb: 2 }} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                            <StyledTextField label="Expiry Date (MM/YY)" fullWidth required sx={{ mb: 2 }} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                            <StyledTextField label="CVV" fullWidth required sx={{ mb: 2 }} value={cvv} onChange={(e) => setCvv(e.target.value)} />

                            <GradientButton type="submit" fullWidth startIcon={<CheckCircle />}>
                                Confirm Booking
                            </GradientButton>

                            {bookingSuccess && <Alert severity="success" sx={{ mt: 2 }}>Booking Successful! Redirecting...</Alert>}
                        </form>
                    </Grid>

                    {/* Billing Summary */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Billing Summary</Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="Consultation Fee" />
                                <Typography>$50.00</Typography>
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="Tax (8%)" />
                                <Typography>$4.00</Typography>
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="Total" sx={{ fontWeight: 'bold' }} />
                                <Typography sx={{ fontWeight: 'bold' }}>$54.00</Typography>
                            </ListItem>
                        </List>
                    </Grid>
                </Grid>
            </GlassCard>
        </PageContainer>
    );
};

export default Booking;
