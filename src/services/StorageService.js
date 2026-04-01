const imagekit = require("../utills/Imagekitutils");

const uploadFile = async (file, vehicleId) => {
  // 🚩 Ensure we have a fallback so we don't get 'undefined' folders
  const folderPath = vehicleId 
    ? `vehicle_vault/active_listings/${vehicleId}` 
    : `vehicle_vault/temp_uploads`;

  try {
    const response = await imagekit.upload({
      file: file.buffer.toString("base64"),
      fileName: `vault_${Date.now()}_${file.originalname}`,
      folder: folderPath // 🚩 Use the consolidated path
    });

    return response;
  } catch (error) {
    throw error;
  }
};

const deleteFile = async (fileId) => {
  try {
    await imagekit.deleteFile(fileId);
    return { success: true };
  } catch (error) {
    // If the file is already gone from ImageKit, we still consider it a success for our DB cleanup
    console.error("ImageKit Deletion Error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { uploadFile, deleteFile };