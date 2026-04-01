const multer = require("multer");
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const mime = file.mimetype.toLowerCase();

  console.log("📸 Uploading file type:", mime); // 🔍 debug

  // ✅ Allow ALL image types (recommended)
  if (mime.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter
});

module.exports = upload;