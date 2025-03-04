import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultantById, createBooking, getConsultantBookingsById } from '../utils/api';
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
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/en'; // Import the locale

const Booking = () => {
    const { id } = useParams();
    const [consultant, setConsultant] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [time, setTime] = useState('');
    const [paymentInfo, setPaymentInfo] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const navigate = useNavigate();

    const [availableTimes, setAvailableTimes] = useState({}); // dynamic times
    const [bookings, setBookings] = useState([]);
    const [isTimeSlotAvailable, setIsTimeSlotAvailable] = useState(true);

    const handleAcceptBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Authentication required. Please login as an admin.");
                return;
            }

            // await acceptBooking(token, bookingId);

            // Update the bookings state to reflect the accepted booking
            setBookings(
                bookings.map((booking) =>
                    booking.id === bookingId
                        ? { ...booking, status: "accepted" }
                        : booking
                )
            );
        } catch (err) {
            setError("Failed to accept booking. Please try again.");
            console.error("Failed to accept booking:", err);
        }
    };

    const isTimeSlotBooked = (date, time) => {
        return bookings.some(
            (booking) => booking.date === date && booking.time === time
        );
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setBookingSuccess(false);

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
    const handleDateChange = (date) => {
      const today = dayjs().startOf('day'); // Get today's date without time
      const selected = dayjs(date).startOf('day'); // Normalize selected date
  
      if (selected.isBefore(today)) {
          alert("You cannot select a today's or past date.");
          return; // Ignore past dates
      }
  
      setSelectedDate(selected);
      setIsTimeSlotAvailable(true); // Reset the availability check when date changes
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
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!consultant) {
        return (
            <Container>
                <Alert severity="error">Consultant not found.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Book Appointment with Dr. {consultant.speciality}
            </Typography>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            label="Selected Date"
                            type="date"
                            value={selectedDate.format('YYYY-MM-DD')}
                            onChange={(e) => handleDateChange(dayjs(e.target.value))}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel id="time-select-label">Select Time Slot</InputLabel>
                            <Select
                                labelId="time-select-label"
                                id="time"
                                value={time}
                                label="Select Time Slot"
                                onChange={(e) => setTime(e.target.value)}
                                required
                            >
                                {generateTimeSlots().map((slot) => (
                                        <MenuItem key={slot} value={slot}>
                                            {slot}
                                        </MenuItem>
                                    ))}
                            </Select>
                            {!isTimeSlotAvailable && (
                                <Alert severity="error">This time slot is already booked. Please select another time.</Alert>
                            )}

                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Payment Information"
                            placeholder="Enter Credit Card Number"
                            fullWidth
                            required
                            value={paymentInfo}
                            onChange={(e) => setPaymentInfo(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Confirm Booking
                        </Button>
                    </Grid>
                </Grid>
            </form>

            {bookingSuccess && (
                <Alert severity="success" sx={{ mt: 3 }}>
                    Booking created successfully! Redirecting to dashboard...
                </Alert>
            )}
        </Container>
    );
};

export default Booking;