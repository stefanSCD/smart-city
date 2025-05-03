// src/services/adminService.js
import { api } from './authService';

// Gestionare angajați
export const getAllEmployees = async () => {
  try {
    const response = await api.get('/admin/employees');
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

export const addEmployee = async (employeeData) => {
  try {
    const response = await api.post('/admin/employees', employeeData);
    return response.data;
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
};

export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await api.put(`/admin/employees/${id}`, employeeData);
    return response.data;
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await api.delete(`/admin/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};

export const resetEmployeePassword = async (id) => {
  try {
    const response = await api.post(`/admin/employees/${id}/reset-password`);
    return response.data;
  } catch (error) {
    console.error('Error resetting employee password:', error);
    throw error;
  }
};

// Gestionare departamente
export const getAllDepartments = async () => {
  try {
    const response = await api.get('/admin/departments');
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

export const addDepartment = async (departmentData) => {
  try {
    const response = await api.post('/admin/departments', departmentData);
    return response.data;
  } catch (error) {
    console.error('Error adding department:', error);
    throw error;
  }
};

// Gestionare camere video
export const getAllCameras = async () => {
  try {
    const response = await api.get('/admin/cameras');
    return response.data;
  } catch (error) {
    console.error('Error fetching cameras:', error);
    throw error;
  }
};

export const addCamera = async (cameraData) => {
  try {
    const response = await api.post('/admin/cameras', cameraData);
    return response.data;
  } catch (error) {
    console.error('Error adding camera:', error);
    throw error;
  }
};

export const updateCamera = async (id, cameraData) => {
  try {
    const response = await api.put(`/admin/cameras/${id}`, cameraData);
    return response.data;
  } catch (error) {
    console.error('Error updating camera:', error);
    throw error;
  }
};

export const deleteCamera = async (id) => {
  try {
    const response = await api.delete(`/admin/cameras/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting camera:', error);
    throw error;
  }
};

export const toggleCameraAI = async (id, aiEnabled) => {
  try {
    const response = await api.patch(`/admin/cameras/${id}/ai`, { aiEnabled });
    return response.data;
  } catch (error) {
    console.error('Error toggling camera AI:', error);
    throw error;
  }
};

export const getCameraStatistics = async () => {
  try {
    const response = await api.get('/admin/cameras/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching camera statistics:', error);
    throw error;
  }
};

// Gestionare notificări
export const getAllNotifications = async () => {
  try {
    const response = await api.get('/admin/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const response = await api.patch(`/admin/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.patch('/admin/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const getCameraAlerts = async () => {
  try {
    const response = await api.get('/admin/notifications/camera-alerts');
    return response.data;
  } catch (error) {
    console.error('Error fetching camera alerts:', error);
    throw error;
  }
};

export default {
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  resetEmployeePassword,
  getAllDepartments,
  addDepartment,
  getAllCameras,
  addCamera,
  updateCamera,
  deleteCamera,
  toggleCameraAI,
  getCameraStatistics,
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getCameraAlerts
};