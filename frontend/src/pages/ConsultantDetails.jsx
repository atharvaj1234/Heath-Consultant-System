import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getConsultantById, sendMessageRequest, chatStatus } from "../utils/api";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { AccessTime, LocationOn, VerifiedUser } from "@mui/icons-material";
import { styled } from "@mui/system";
import { Star } from 'lucide-react';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  // boxShadow: theme.shadows[5],
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.03)",
  },
}));

const ConsultantDetails = () => {
  const { id } = useParams();
  const [consultant, setConsultant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'guest');
  const [bookingId, setBookingId] = useState();
  const [hasBooking, setHasBooking] = useState();
  const [openMessaging, setOpenMessaging] = useState(false);
  const [isRequested, setIsRequested] = useState(false);


  useEffect(() => {
    const fetchConsultant = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getConsultantById(id);
        setConsultant(data);
        //Check If User Has A Booking

      } catch (err) {
        setError("Failed to retrieve consultant details. Please try again.");
        setConsultant(null);
        console.error("Failed to fetch consultant:", err);
      } finally {
        setLoading(false);
      }
    };

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
        if (data.message) {
          setOpenMessaging(false)
        } else {
          setOpenMessaging(true);
        }

      } catch (err) {
        setError('Failed to Retrieve Chat Status, please try again.');
        console.error("Failed to fetch consultant:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchConsultant();
    getChatState();
  }, [id]);


  const sendMsgRequest = async (consultantId, bookingId) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login.');
        return;
      }
      await sendMessageRequest(token, consultantId, bookingId);
      console.log(consultantId)
      setOpenMessaging(true);
      const data = await chatStatus(token, id);
    } catch (err) {
      setError('Failed to Request Msg. Please try again.');
      console.error('Failed to fetch consultant:', err);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
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
        <CardMedia
          component="img"
          height="300"
          image={consultant.consultant.profilePicture || "https://placehold.co/600x400"}
          alt={consultant.consultant.fullName}
          sx={{ objectFit: "cover" }}
        />
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" component="h2" gutterBottom>
                {consultant.consultant.fullName}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                <Chip
                  avatar={<VerifiedUser />}
                  label={consultant.consultant.speciality}
                  size="small"
                />
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
              {userRole === 'user' && (!openMessaging ? (
                <Button
                  onClick={() => sendMsgRequest(id, 1)}
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Message Request
                </Button>
              ) : (
                <Button
                  component={Link}
                  to={`/messages`}
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Messaging Now!
                </Button>
              ))}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">About</Typography>
              <Typography variant="body2" paragraph>
                {consultant.consultant.bio}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Qualifications</Typography>
              <Typography variant="body2">
                {consultant.consultant.qualification}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Areas of Expertise</Typography>
              <Typography variant="body2">
                {consultant.consultant.areasOfExpertise}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Availability</Typography>
              <Box sx={{ mt: 1 }}>
                {consultant.consultant.availability ? (
                  Object.entries(
                    parseAvailability(consultant.consultant.availability)
                  ).map(([day, { startTime, endTime }]) => (
                    <Box
                      key={day}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {day}:
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AccessTime sx={{ mr: 0.5 }} fontSize="small" />
                        <Typography variant="body2">
                          {startTime} - {endTime}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography>Not available at the moment</Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Reviews</Typography>
              {consultant.reviews && consultant.reviews.length > 0 ? (
                consultant.reviews.map((review) => (
                  <div key={review.id} className="mb-4 p-4 bg-gray-50 rounded-lg shadow-md">
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-5 w-5 ${star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-gray-700">{review.review}</p>
                  </div>
                ))
              ) : (
                <Typography>No reviews yet.</Typography>
              )}
              <Button
                component={Link}
                to={`/review/${consultant.consultant.id}`}
                variant="contained"
                color="primary"
                size="small"
              >
                Add a Review
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default ConsultantDetails;