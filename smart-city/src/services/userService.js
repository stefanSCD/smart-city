import axios from 'axios';
// Ar trebui să fie ceva de genul:
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  export const getUserData = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };


  
  export const updateUserProfile = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user profile');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  export const changePassword = async (passwordData) => {
    try {
      console.log('Sending password change request:', passwordData); // Pentru debugging
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData) // Trimite direct datele, fără mapare
      });
  
      console.log('Password change response status:', response.status); // Pentru debugging
      
      if (!response.ok) {
        // Încearcă să citești răspunsul ca JSON, dar fii pregătit pentru erori
        let errorMessage = 'Failed to change password';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error in changePassword service:', error);
      throw error;
    }
  };


  // În userService.js
  export const getUserNotifications = async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID required');
      }
      const response = await axios.get(`${API_URL}/users/notifications?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error retrieving notifications:', error);
      return []; // Returnează un array gol în loc să arunce eroare
    }
  };

  export const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark notification as read');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  export const uploadProfileImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
  
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload profile image');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  };

  // În userService.js
  export const getUserRecentReports = async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID required');
      }
      const response = await axios.get(`${API_URL}/users/reports/recent?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      return []; // Returnează un array gol în loc să arunce eroare
    }
  };

  export const updateNotificationPreferences = async (preferences) => {
    try {
      const response = await fetch(`${API_URL}/notification-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(preferences)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update notification preferences');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  };
  
  export default {
    getUserData,
    updateUserProfile,
    changePassword,
    getUserNotifications,
    markNotificationAsRead,
    uploadProfileImage,
    getUserRecentReports,
    updateNotificationPreferences
  };