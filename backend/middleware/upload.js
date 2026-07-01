const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dossier = file.fieldname === 'cv' ? 'uploads/cv' : 'uploads/photos';
        cb(null, dossier);
    },
    filename: (req, file, cb) => {
        const nomUnique = Date.now() + '-' + Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);
        cb(null, nomUnique);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max 
});
module.exports = upload;