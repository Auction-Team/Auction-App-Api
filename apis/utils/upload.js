require('dotenv').config();
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const PATH_USER = 'user'

const s3Config = new AWS.S3({
    accessKeyId: process.env.AWS_IAM_USER_KEY,
    secretAccessKey: process.env.AWS_IAM_USER_SECRET,
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const multerS3UploadUser = multerS3({
    s3: s3Config,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        cb(null, PATH_USER + '/' + new Date().toISOString().replace(/:/g, '-') + file.originalname);
    },
});

const uploadImageUser = multer({
    storage: multerS3UploadUser,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5, // we are allowing only 5 MB files
    },
});

exports.uploadImageUser = uploadImageUser;
exports.s3 = s3Config;
