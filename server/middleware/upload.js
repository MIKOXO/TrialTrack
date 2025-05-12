import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/documents");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext !== ".pdf" && ext !== ".docx" && ext !== ".txt") {
    return cb(new Error("Only .pdf, .docx and .txt format allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

export default upload;
