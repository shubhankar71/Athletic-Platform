const cloudinary = require('cloudinary').v2;

const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME.trim() : '';
  const apiKey = process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.trim() : '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.trim() : '';

  // SAFE diagnostic logging required by project rules (NEVER print actual key/secret values)
  console.log(`CLOUDINARY_CLOUD_NAME loaded: ${cloudName ? 'YES' : 'NO'}`);
  console.log(`CLOUDINARY_API_KEY loaded: ${apiKey ? 'YES' : 'NO'}`);
  console.log(`CLOUDINARY_API_SECRET loaded: ${apiSecret ? 'YES' : 'NO'}`);

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloudinary_url: process.env.CLOUDINARY_URL.trim(),
      secure: true,
    });
  } else if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }
};

module.exports = { cloudinary, configureCloudinary };
