import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getConsultantById, sendMessageRequest, chatStatus, getBookings } from "../utils/api";
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Box,
    Chip,
    CircularProgress,
    Alert,
    Button,
    Avatar,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from "@mui/material";
import { AccessTime, LocationOn, VerifiedUser } from "@mui/icons-material";
import { styled } from "@mui/system";
import { Star, MessageSquare, Calendar, User, Briefcase } from 'lucide-react';

const gradient = "linear-gradient(45deg, #667eea 30%, #764ba2 90%)";

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    transition: "transform 0.3s ease-in-out",
    "&:hover": {
        transform: "scale(1.02)",
    },
}));

const ConsultantDetails = () => {
    const { id } = useParams();
    const [consultant, setConsultant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [bookingId, setBookingId] = useState(0);
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'guest');
    const [openMessaging, setOpenMessaging] = useState(false);

    // New state for the message dialog
    const [messageDialogOpen, setMessageBoxDialog] = useState(false);
    const [messageText, setMessageText] = useState('');

    useEffect(() => {
        const fetchConsultant = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getConsultantById(id);
                console.log(data)
                setConsultant(data);
            } catch (err) {
                setError("Failed to retrieve consultant details. Please try again.");
                setConsultant(null);
                console.error("Failed to fetch consultant:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchBookings = async () => {
          setLoading(true);
            setError('');
            try {
              function getAcceptedAppointmentId(appointments) {
                for (let appointment of appointments) {
                    if (
                        appointment.consultantId.toString() === id &&
                        (appointment.status === "accepted" || appointment.status === "pending") 
                    ) {
                        return appointment.id;
                    }
                }
                return 0; // Return null if no matching appointment is found
            }
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication required. Please login.');
                    return;
                }
                const data = await getBookings(token);
                console.log(data)
                setBookingId(getAcceptedAppointmentId(data));
            } catch (err) {
                setError('Failed to Retrieve Chat Status, please try again.');
                console.error("Failed to fetch consultant:", err);
            } finally {
                setLoading(false);
            }
        }

        const getChatState = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication required. Please login.');
                    return;
                }
                const data = await chatStatus(token, id);
                console.log(data.request.status)
                setOpenMessaging(data.request.status);
            } catch (err) {
                // setError('Failed to Retrieve Chat Status, please try again.');
                console.error("Failed to fetch consultant:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchConsultant();
        fetchBookings();
        getChatState();
    }, [id]);


    const handleOpenMessageDialog = () => {
      setMessageBoxDialog(true);
    };

    const handleCloseMessageDialog = () => {
        setMessageBoxDialog(false);
        setMessageText(''); // Clear the message when closing
    };

    const handleMessageChange = (event) => {
        setMessageText(event.target.value);
    };


    const sendMsgRequest = async (consultantId) => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required. Please login.');
                return;
            }
            // Use the message from the state instead of prompt
            await sendMessageRequest(token, consultantId, bookingId, messageText);
            setOpenMessaging("pending");
            handleCloseMessageDialog(); // Close dialog after sending
        } catch (err) {
            setError('Failed to Request Message. Please try again.');
            console.error('Failed to request message:', err);
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <Container sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "80vh",
            }}>
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

    const parseAvailability = (availability) => {
        try {
            return JSON.parse(availability);
        } catch (e) {
            console.error("Failed to parse availability:", availability);
            return {};
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 5, mb: 4 }}>
            <StyledCard>

                {/* Header Section */}
                <Box sx={{
                    background: gradient,
                    color: 'white',
                    padding: 4,
                    textAlign: 'center',
                }}>
                    <Avatar
                        alt={consultant.consultant.fullName}
                        src={`http://localhost:5555/${consultant.consultant.profilePicture}`}
                        sx={{ width: 80, height: 80, margin: '0 auto', border: '3px solid white' }}
                    />
                    <Typography variant="h5" component="h2" mt={2}>
                        {consultant.consultant.fullName}
                    </Typography>
                    <Chip
                        label={consultant.consultant.speciality}
                        size="small"
                        sx={{ mt: 1, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                </Box>


                <CardContent>
                    <Grid container spacing={3}>

                        {/* About Section */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><User className="mr-1 w-5 h-5" />About</Typography>
                            <Typography variant="body2" paragraph>{consultant.consultant.bio || "No bio provided."}</Typography>
                        </Grid>

                        {/* Qualifications and Expertise */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><Briefcase className="mr-1 w-4 h-4" />Qualifications</Typography>
                            <Typography variant="body2">{consultant.consultant.qualification || "Not specified"}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><Star className="mr-1 w-4 h-4" />Areas of Expertise</Typography>
                            <Typography variant="body2">{consultant.consultant.areasOfExpertise || "Not specified"}</Typography>
                        </Grid>

                        {/* Availability */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><Calendar className="mr-1 w-5 h-5" />Availability</Typography>
                            <Box sx={{ mt: 1 }}>
                                {consultant.consultant.availability ? (
                                    Object.entries(parseAvailability(consultant.consultant.availability)).map(([day, { startTime, endTime }]) => (
                                        <Box key={day} sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            mb: 1,
                                            padding: 1,
                                            borderRadius: 1,
                                            backgroundColor: 'rgba(0,0,0,0.03)'
                                        }}>
                                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{day}:</Typography>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <AccessTime sx={{ mr: 0.5, fontSize: 'small' }} />
                                                <Typography variant="body2">{startTime} - {endTime}</Typography>
                                            </Box>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography>Not available at the moment</Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Reviews Section */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><Star className="mr-1 w-5 h-5" />Reviews</Typography>
                            <div className="flex flex-col overflow-auto max-h-[300px]">
                            {consultant.reviews && consultant.reviews.length > 0 ? (
                                consultant.reviews.map((review) => (
                                    <Box key={review.id} sx={{
                                        mb: 2,
                                        padding: 2,
                                        borderRadius: 2,
                                        backgroundColor: 'rgba(0,0,0,0.03)'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            {[...Array(5)].map((_, index) => (
                                                <Star key={index} className={`h-4 w-4 ${index < review.rating ? 'text-yellow-500' : 'text-gray-300'}`} />
                                            ))}
                                        </Box>
                                        <Typography variant="body2" paragraph>{review.review}</Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography>No reviews yet.</Typography>
                            )}
                            </div>
                            {userRole === 'user' && bookingId != 0 && (
                            <Button
                                component={Link}
                                to={`/review/${consultant.consultant.id}`}
                                variant="outlined"
                                size="small"
                                sx={{ mt: 2 }}
                            >
                                Add a Review
                            </Button>)}
                        </Grid>


                        {/* Message Request Button */}
                        <Grid item xs={12} sx={{ textAlign: 'center' }}>
                            {userRole === 'user' && bookingId != 0 ? (
                                openMessaging == 'accepted' ? (
                                    <Button
                                        component={Link}
                                        to={`/messages`}
                                        variant="contained"
                                        size="large"
                                        sx={{ backgroundColor: '#764ba2', '&:hover': { backgroundColor: '#667eea' } }}
                                        startIcon={<MessageSquare />}
                                    >
                                        Message!
                                    </Button>
                                ) : (openMessaging == 'pending' ? (
                                  <Button
                                      // component={Link}
                                      // to={`/messages`}
                                      variant="contained"
                                      size="large"
                                      sx={{ backgroundColor: '#764ba2', '&:hover': { backgroundColor: '#667eea' } }}
                                      startIcon={<MessageSquare />}
                                  >
                                      Request Pending!
                                  </Button>
                              ) : (
                                    <Button
                                        onClick={handleOpenMessageDialog}
                                        variant="contained"
                                        size="large"
                                        sx={{ backgroundColor: '#764ba2', '&:hover': { backgroundColor: '#667eea' } }}
                                        startIcon={<MessageSquare />}
                                    >
                                        Message Request
                                    </Button>
                                ))
                            ):(
                              <Link
                              to={`/booking/${id}`}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300 inline-block"
                            >
                              Book Appointment
                            </Link>
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
            </StyledCard>

             {/* Message Request Dialog */}
             <Dialog open={messageDialogOpen} onClose={handleCloseMessageDialog}>
                <DialogTitle>Send Message Request</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter the message you want to send to the consultant.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="message"
                        label="Your Message"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={messageText}
                        onChange={handleMessageChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseMessageDialog}>Cancel</Button>
                    <Button onClick={() => sendMsgRequest(id)}>Send Request</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ConsultantDetails;