const jwt=require('jsonwebtoken');
const httpError = require("../models/http_errors");
module.exports = (req, res, next) => {
  if(req.method==='OPTIONS'){
    return next();
  }
  let token;
  try {
    token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return next(new httpError("Authentication Failed", 401));
    }
    const decodedToken=jwt.verify(token,"sai_dont_share");
    req.userData={userId:decodedToken.userId};
    next();
  } catch (err) {
    console.log('sai',err)
    return next(new httpError("Authentication Failed", 401));
  }
};
