const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { verifyToken, requireSchoolOrAdmin, optionalAuth } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');
const {
  validateResourceCreation,
  validateResourceUpdate,
  validateResourceId,
  validatePagination,
  validateSearch
} = require('../middleware/validation');

// Public routes (with optional authentication)
router.get('/', optionalAuth, validatePagination, validateSearch, resourceController.getResources);
router.get('/all', verifyToken, validatePagination, validateSearch, resourceController.getAllResources);
router.get('/popular', optionalAuth, resourceController.getPopularResources);
router.get('/:id', optionalAuth, validateResourceId, resourceController.getResourceById);
router.get('/:id/download', optionalAuth, validateResourceId, resourceController.downloadResource);

// Protected routes
router.post('/', verifyToken, requireSchoolOrAdmin, uploadMultiple, handleUploadError, validateResourceCreation, resourceController.createResource);
router.put('/:id', verifyToken, requireSchoolOrAdmin, validateResourceId, validateResourceUpdate, resourceController.updateResource);
router.delete('/:id', verifyToken, requireSchoolOrAdmin, validateResourceId, resourceController.deleteResource);
router.post('/:id/like', verifyToken, validateResourceId, resourceController.toggleLike);
router.get('/user/my-resources', verifyToken, validatePagination, resourceController.getUserResources);

module.exports = router;

