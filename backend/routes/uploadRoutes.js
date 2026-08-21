const express = require('express');
const router = express.Router();
const multer = require('multer');
const os = require('os');
const { uploadVideoToCloudinary } = require('../controllers/uploadController.js');
const { requireAthlete } = require('../middleware/authMiddleware.js');

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB max
});

// Protect video upload endpoint with requireAthlete middleware
router.post('/video', requireAthlete, upload.single('video'), uploadVideoToCloudinary);

module.exports = router;
