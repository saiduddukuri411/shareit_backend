const API_KEY =process.env.GOOGLE_API_KEY;
const axios = require("axios");
const HttpError =require('../models/http_errors');

async function getCoordinates(address) {
  const link = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${API_KEY}`;

  const response=await axios.get(link);
  const data=response.data;
  if(!data || data.status==="ZERO_RESULTS"){
      throw new HttpError("User entered in valid location",422);
  }else{
      const coordinates=data.results[0].geometry.location;
      return coordinates
  }
}


module.exports=getCoordinates;

