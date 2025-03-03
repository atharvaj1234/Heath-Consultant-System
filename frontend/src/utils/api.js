
import axios from 'axios';

const BASE_URL = 'http://localhost:5555';

// Authentication Endpoints
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const registerUser = async (fullName, email, password, role, bloodGroup, medicalHistory, currentPrescriptions, contactInformation, areasOfExpertise) => {
  try {
    const payload = {
      fullName,
      email,
      password,
      role
    };

    if (role === 'user') {
      payload.bloodGroup = bloodGroup;
      payload.medicalHistory = medicalHistory;
      payload.currentPrescriptions = currentPrescriptions;
    } else if (role === 'consultant') {
      payload.contactInformation = contactInformation;
      payload.areasOfExpertise = areasOfExpertise;
    }

    const response = await axios.post(`${BASE_URL}/api/register`, payload);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

// Data Endpoints
export const getProfile = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve profile:', error);
    throw error;
  }
};

export const updateProfile = async (token, fullName, email, bloodGroup, medicalHistory, currentPrescriptions, contactInformation, areasOfExpertise) => {
  try {
    const payload = {
      fullName,
      email
    };

    if (bloodGroup && medicalHistory && currentPrescriptions) {
      payload.bloodGroup = bloodGroup;
      payload.medicalHistory = medicalHistory;
      payload.currentPrescriptions = currentPrescriptions;
    }

    if (contactInformation && areasOfExpertise) {
      payload.contactInformation = contactInformation;
      payload.areasOfExpertise = areasOfExpertise;
    }

    const response = await axios.put(`${BASE_URL}/api/profile`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
};

export const getConsultantProfile = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/consultant/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve consultant profile:', error);
    throw error;
  }
};

export const updateConsultantProfile = async (token, specialty, qualifications, availability) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/consultant/profile`, { specialty, qualifications, availability }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update consultant profile:', error);
    throw error;
  }
};

export const getConsultants = async (specialty, rating, availability) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/consultants`, {
      params: { specialty, rating, availability },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve consultants:', error);
    throw error;
  }
};

export const getConsultantById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/consultants/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve consultant:', error);
    throw error;
  }
};

export const getBookings = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve bookings:', error);
    throw error;
  }
};

export const createBooking = async (token, consultantId, date, time) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/bookings`, { consultantId, date, time }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create booking:', error);
    throw error;
  }
};

export const getHealthRecords = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/healthrecords`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve health records:', error);
    throw error;
  }
};

export const createHealthRecord = async (token, medicalHistory, ongoingTreatments, prescriptions) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/healthrecords`, { medicalHistory, ongoingTreatments, prescriptions }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create health record:', error);
    throw error;
  }
};

export const getMessages = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve messages:', error);
    throw error;
  }
};

export const createMessage = async (token, consultantId, message) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/messages`, { consultantId, message }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create message:', error);
    throw error;
  }
};

export const getPayments = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/payments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve payments:', error);
    throw error;
  }
};

export const createReview = async (token, consultantId, rating, review) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/reviews`, { consultantId, rating, review }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create review:', error);
    throw error;
  }
};

// Admin Endpoints
export const getAdminUsers = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve users:', error);
    throw error;
  }
};

export const getAdminConsultants = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/consultants`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve consultants:', error);
    throw error;
  }
};

export const getAdminBookings = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve bookings:', error);
    throw error;
  }
};

export const submitContactForm = async (name, email, subject, message) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/contact`, { name, email, subject, message });
    return response.data;
  } catch (error) {
    console.error('Failed to submit contact form:', error);
    throw error;
  }
};

export const acceptBooking = async (token, bookingId) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/bookings/${bookingId}/accept`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to accept booking:', error);
    throw error;
  }
};

export const getConsultantBookings = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      // Add a parameter to filter by consultantId if needed.  The backend needs to support this.
      //params: { consultantId: someConsultantId } //  Replace someConsultantId with the actual consultant's ID
    });
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve consultant bookings:', error);
    throw error;
  }
};
