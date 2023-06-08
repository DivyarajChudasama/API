const cors = require("cors");
const express = require("express");
const app = express();
const initRoutes = require("./routes");

// var corsOptions = {
//   origin: "http://localhost:8081"
// };

// app.use(cors(corsOptions));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
initRoutes(app);

let PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Running at localhost:${PORT}`);
});
