// API Configuration
const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  VERIFY_TOKEN: `${API_BASE_URL}/api/auth/verify`,
  
  // User endpoints
  USERS: `${API_BASE_URL}/api/auth/admin/users`,
  USER_PROFILE: `${API_BASE_URL}/api/users/profile`,
  
  // Resource endpoints
  RESOURCES: `${API_BASE_URL}/api/resources`,
  RESOURCES_ALL: `${API_BASE_URL}/api/resources/all`,
  RESOURCES_POPULAR: `${API_BASE_URL}/api/resources/popular`,
  RESOURCE_BY_ID: (id: number) => `${API_BASE_URL}/api/resources/${id}`,
  RESOURCE_DOWNLOAD: (id: number) => `${API_BASE_URL}/api/resources/${id}/download`,
  RESOURCE_LIKE: (id: number) => `${API_BASE_URL}/api/resources/${id}/like`,
  USER_RESOURCES: `${API_BASE_URL}/api/resources/user/my-resources`,
  
  // Metadata endpoints
  GRADES: `${API_BASE_URL}/api/meta/grades`,
  SUBJECTS: `${API_BASE_URL}/api/meta/subjects`,
  RESOURCE_TYPES: `${API_BASE_URL}/api/meta/resource-types`,
  TAGS: `${API_BASE_URL}/api/meta/tags`,
  
  // File uploads
  UPLOAD_RESOURCE: `${API_BASE_URL}/api/resources`,
  UPLOAD_PREVIEW_IMAGE: `${API_BASE_URL}/api/upload/preview-image`,
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get file URL
export const getFileUrl = (filePath: string): string => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  return `${API_BASE_URL}/${filePath}`;
};
