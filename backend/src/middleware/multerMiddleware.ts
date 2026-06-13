import multer from "multer";

// Multer middleware setup to store uploaded files in public/data/uploads/
const upload = multer({ dest: "./public/data/uploads/" });

export default upload;