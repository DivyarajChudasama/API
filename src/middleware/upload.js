const util = require("util");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const dbConfig = require("../config/db");

var storage = new GridFsStorage({
  url: dbConfig.url + dbConfig.database,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg","video/x-matroska", "image/gif","application/pdf","video/mp4","application/zip","application/x-rar-compressed",
                   "application/x-dc","model/ifc","image/vnd.dwg","image/bmp","application/vnd.ms-excel","text/plain","audio/aac","application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    ,"text/csv","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/java-archive","application/json","audio/mpeg",
                     "video/mpeg","audio/mpeg","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/xml",
                      "application/octet-stream"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${file.originalname}`;
      return filename;
    }

    return {
      bucketName: dbConfig.imgBucket,
      filename: `${file.originalname}`
    };
  }
});

var uploadFiles = multer({ storage: storage }).single("file");
var uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;
