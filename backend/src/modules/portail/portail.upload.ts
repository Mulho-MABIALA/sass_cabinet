import multer from "multer";
import { BadRequestError } from "../../shared/AppError";

const TYPES_AUTORISES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!TYPES_AUTORISES.has(file.mimetype)) {
      callback(new BadRequestError("Type de fichier non autorisé (PDF, JPEG, PNG, WEBP uniquement)"));
      return;
    }
    callback(null, true);
  },
}).single("file");
