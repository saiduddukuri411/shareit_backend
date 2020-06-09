const { router } = require("./Routes/places-route");
const path=require('path')
const mongoose = require("mongoose");
const fs=require('fs');
const cors=require('cors');

const express = require("express");
const bodyParser = require("body-parser");
const HttpError = require("./models/http_errors");
const usersroute = require("./Routes/users-rote");

const app = express();

app.use(bodyParser.json());
app.use('/uploads/images',express.static(path.join('uploads','images')))
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", '*');
  // response.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods",'GET,POST,PATCH,DELETE,HEAD');

  next();
});
app.use("/api/places", router);
app.use("/api/users", usersroute);
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});
app.use((error, req, res, next) => {

  if(req.file){
    fs.unlink(req.file.path,(err)=>{
      console.log(err)
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured" });
});
const url =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-rbtfy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

mongoose
  .connect(url)
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });
