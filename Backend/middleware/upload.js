const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Use path.resolve for production-safe absolute paths
const UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads', 'vendors');
const PROFILE_DIR = path.resolve(__dirname, '..', 'uploads', 'profiles');
const PRODUCT_DIR = path.resolve(__dirname, '..', 'uploads', 'products');

// Ensure directories exist
[UPLOAD_DIR, PROFILE_DIR, PRODUCT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer memory storage (we process with Sharp before writing to disk)
const storage = multer.memoryStorage();

// File filter: strict image validation (MIME + Extension)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isMimeValid = allowedMimeTypes.includes(file.mimetype);
  const isExtensionValid = allowedExtensions.includes(fileExtension);

  if (isMimeValid && isExtensionValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Max 5MB per file
const limits = { fileSize: 5 * 1024 * 1024 };

// Vendor image uploads (owner photo + document photo)
const vendorUpload = multer({ 
  storage, 
  fileFilter, 
  limits 
});

// Profile picture upload (single file)
const profileUpload = multer({ 
  storage, 
  fileFilter, 
  limits 
});

/**
 * Process and save an image buffer using Sharp.
 * Resizes to max 800px width, converts to WebP, quality 80.
 * Returns the relative path from the project root (for DB storage).
 */
const processAndSaveImage = async (buffer, filename, targetDir, shouldEncrypt = false) => {
  const { encryptBuffer } = require('../utils/encryption');
  const webpFilename = `${filename}.webp`;
  const absolutePath = path.join(targetDir, webpFilename);

  // Ensure directory exists dynamically right before upload
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  try {
    const processedBuffer = await sharp(buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    if (shouldEncrypt) {
      const encryptedBuffer = encryptBuffer(processedBuffer);
      fs.writeFileSync(absolutePath, encryptedBuffer);
    } else {
      fs.writeFileSync(absolutePath, processedBuffer);
    }
  } catch (err) {
    console.error('Sharp processing error:', err);
    throw new Error('Failed to process image. The file might be corrupt or not a valid image.');
  }

  // Return path relative to the backend root for DB storage and URL serving
  const relativePath = path.relative(
    path.resolve(__dirname, '..'),
    absolutePath
  ).replace(/\\/g, '/'); // Normalize Windows backslashes

  return relativePath;
};

/**
 * Delete an image file from the filesystem.
 * @param {string} relativePath - The relative path stored in the DB.
 */
const deleteImage = (relativePath) => {
  if (!relativePath) return;
  const absolutePath = path.resolve(__dirname, '..', relativePath);
  if (fs.existsSync(absolutePath)) {
    try {
      fs.unlinkSync(absolutePath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }
};

// Product image upload (multiple files, max 5)
const productUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }
});

module.exports = {
  vendorUpload,
  profileUpload,
  productUpload,
  processAndSaveImage,
  deleteImage,
  UPLOAD_DIR,
  PROFILE_DIR,
  PRODUCT_DIR
};
