const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoute = require("./routes/auth");
const picturesRoute = require("./routes/pictures");
const cataloguesRoute = require("./routes/catalogues");
const userRoute = require("./routes/users");
const tokenRoute = require("./routes/tokens");
const supplierRoute = require("./routes/suppliers");
const salesLayersRoute = require("./routes/saleslayers");
const categoriesRoute = require("./routes/categories");
const tagRoutes = require("./routes/tags");
const ackerRoutes       = require("./routes/ackermans");
const broadsheetsRoutes = require("./routes/broadsheets");
dotenv.config();

//////
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("LIVE Connection - Picnick API_KEY Catalogue 4.0.0"))
  .catch((err) => {
    console.error(err);
  });
//////

//////
app.use(express.json({limit: '120mb'}));
app.use(express.urlencoded({limit: '120mb'}));
app.use(cors({
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
  origin: '*'
})); 

/////////////--
//Routes
app.use("/api/auth", authRoute);
app.use("/api/pictures", picturesRoute);
app.use("/api/catalogues", cataloguesRoute);
app.use("/api/users", userRoute);
app.use("/api/tokens", tokenRoute);
app.use("/api/suppliers", supplierRoute);
app.use("/api/saleslayers", salesLayersRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/tags", tagRoutes);
app.use("/api/ackermans", ackerRoutes);
app.use("/api/broadsheets", broadsheetsRoutes);
////////////--

app.use("/", function(req, res){
  //res.send("Hello World");
  res.sendFile(__dirname + "/index.html");
});
/////////////////////////////////////

const port = process.env.PORT || 8585;
app.listen(port, () => {
    console.log(`listneing on port ${port}!`)
});