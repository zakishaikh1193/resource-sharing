const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage - optimized for speed
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Simple flat structure for faster access
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp for better organization
    const timestamp = Date.now();
    const uniqueName = `${timestamp}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter function - simplified and faster
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'zip', 'rar',
    'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'jpg', 'jpeg', 'png', 'gif'
  ];
  
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed`), false);
  }
};

// Configure multer - optimized for large files
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB limit
    files: 2, // Allow 2 files: main file + preview image
    fieldSize: 10 * 1024 * 1024, // 10MB for text fields
    fieldNameSize: 100,
    fieldValueSize: 10 * 1024 * 1024 // 10MB for field values
  }
});

// Preview image filter - only images
const previewImageFilter = (req, file, cb) => {
  const allowedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedImageTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Preview image must be: ${allowedImageTypes.join(', ')}`), false);
  }
};

// Configure multer for preview images
const previewImageUpload = multer({
  storage: storage,
  fileFilter: previewImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for preview images
    files: 1
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 1GB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file allowed per upload.'
      });
    }
    if (error.code === 'LIMIT_FIELD_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Field size too large.'
      });
    }
  }
  
  if (error.message.includes('File type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  console.error('File upload error:', error);
  return res.status(500).json({
    success: false,
    message: 'File upload failed'
  });
};

// Single file upload middleware
const uploadSingle = upload.single('file');

// Multiple files upload middleware (main file + preview image)
const uploadMultiple = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'preview_image', maxCount: 1 }
]);

// Preview image upload middleware
const uploadPreviewImage = previewImageUpload.single('preview_image');

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadPreviewImage,
  handleUploadError
};
