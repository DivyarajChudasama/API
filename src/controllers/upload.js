const upload = require("../middleware/upload");
const dbConfig = require("../config/db");

const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;

const url = dbConfig.url;

const baseUrl = "https://image-api-90tl.onrender.com/files";

const mongoClient = new MongoClient(url);

const uploadFiles = async (req, res) => {
  try {
    await upload(req, res);
    console.log(req.file);

    if (req.file == undefined) {
      return res.send({
        message: "You must select a file.",
      });
    }

    return res.send({
      message: "File has been uploaded.",
    });
  } catch (error) {
    console.log(error);

    return res.send({
      message: `Error when trying upload image: ${error}`,
    });
  }
};

const getListFiles = async (req, res) => {
  try {
    await mongoClient.connect();

    const database = mongoClient.db(dbConfig.database);
    const images = database.collection(dbConfig.imgBucket + ".files");

    const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters
    const limit = 5; // Number of files per page

    const cursor = images.find({})
      .skip((page - 1) * limit) // Skip files based on the page number and limit
      .limit(limit); // Limit the number of files per page

    if ((await cursor.count()) === 0) {
      return res.status(500).send({
        message: "No files found!",
      });
    }

    let fileInfos = [];
    await cursor.forEach((doc) => {
      fileInfos.push({
        name: doc.filename,
        url: baseUrl + doc.filename,
      });
    });

    const totalFiles = await images.countDocuments(); // Get the total number of files
    const totalPages = Math.ceil(totalFiles / limit); // Calculate the total number of pages

    let fileHtml = fileInfos
      .map((file) => `<a href="${file.url}">${file.name}</a><br>`)
      .join("");

    const nextPage = page + 1; // Calculate the next page number

    const htmlResponse = `
      <div>
        ${fileHtml}
      </div>
      <div>
        Page ${page} of ${totalPages}
        <form action="/files" method="GET">
          <input type="hidden" name="page" value="${nextPage}">
          <button type="submit">Next Page</button>
        </form>
      </div>
    `;

    return res.status(200).send(htmlResponse);
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const download = async (req, res) => {
  try {
    await mongoClient.connect();

    const database = mongoClient.db(dbConfig.database);
    const bucket = new GridFSBucket(database, {
      bucketName: dbConfig.imgBucket,
    });

    let downloadStream = bucket.openDownloadStreamByName(req.params.name);

    downloadStream.on("data", function (data) {
      return res.status(200).write(data);
    });

    downloadStream.on("error", function (err) {
      return res.status(404).send({ message: "Cannot download the Image!" });
    });

    downloadStream.on("end", () => {
      return res.end();
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

module.exports = {
  uploadFiles,
  getListFiles,
  download,
};
