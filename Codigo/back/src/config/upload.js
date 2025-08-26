// back/src/config/upload.js
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determinar pasta baseada no tipo de arquivo
    let folder = 'uploads/';
    
    if (file.mimetype.startsWith('image/')) {
      folder += 'images/';
    } else if (file.mimetype.startsWith('video/')) {
      folder += 'videos/';
    } else if (file.mimetype === 'application/pdf') {
      folder += 'pdfs/';
    } else {
      folder += 'documents/';
    }
    
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    // Gerar nome único para o arquivo
    const uniqueSuffix = crypto.randomBytes(6).toString('hex');
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Remover caracteres especiais do nome
    const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, `${safeName}_${timestamp}_${uniqueSuffix}${ext}`);
  }
});

// Filtro de tipos de arquivo
const fileFilter = (req, file, cb) => {
  // Tipos permitidos
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB
  }
});

// Middleware para upload único
export const uploadSingle = (fieldName) => upload.single(fieldName);

// Middleware para múltiplos uploads
export const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Middleware para campos mistos
export const uploadFields = (fields) => upload.fields(fields);

export default upload;