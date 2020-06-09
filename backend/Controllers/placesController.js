const { v4: uuidv4 } = require("uuid");
const HttpError = require("../models/http_errors");
const { validationResult } = require("express-validator");
const getCoordinates = require("../Location/getCoordinates");
const fs=require('fs');



// mongoose imports
const mongoose=require('mongoose');
const { placeModel } = require("../models/place");
const userModel=require('../models/users');

const getPlaceById = async(req, res, next) => {
  const placeid = req.params.placeid;
  let data;
  try{
    data = await placeModel.findById(placeid).exec();
  }catch(error){
   const err=new HttpError("COuldnt retrieve data,check ur inputs",500)
   throw next(err)
  }
  
  if (data) {
    res.json({data:data.toObject({getters:true})});
  } else {
    return next(new HttpError("couldent find places with that id", 404));
  }
};

const getPlaceByUserId = async(req, res, next) => {
  const userId = req.params.userId;
  //let data;
  let userWithPlaces;
  try{
    userWithPlaces = await userModel.findById(userId).populate('places');
  }catch(error){
    return next(new HttpError('Fetching places failed, try again',500));
  }
  
  if (userWithPlaces) {
    res.json({data:userWithPlaces.places.map(place=>place.toObject({getters:true}))});
  } else {
    return next(new HttpError("data with that user id not found", 404));
  }
};

const createPlace = async (req, res, next) => {
  const { title, description, address } = req.body;
  const owner=req.userData.userId;
  let coordinates;
  try {
    coordinates = await getCoordinates(address);
  } catch (error) {
    return next(error);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    
    return next(new HttpError("invalid inputs passed , check your data", 422));
  }
  const createdPlace = new placeModel({
    title,
    description,
    address,
    location: coordinates,
    image:req.file.path,
    owner:req.userData.userId,
  });
  let user;
  try{
      user= await userModel.findById(owner).exec();
  }catch(err){
   return next(new HttpError('Something went wrong, try creating again',500))
  }
  if(!user){
    return next(new HttpError('Could not find user for provided id',404))
  }
  try{
    const sess=await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({session:sess});
    user.places.push(createdPlace); //only adds places id and it was done by mongoose
    await user.save({session:sess});
    await sess.commitTransaction();
  }catch(error){
    const err=new HttpError('creating place failed, please try again',500)
    return next(err);
  }
  
  res.status(201).json({ place: createdPlace });
};

const updatePlace = async(req, res, next) => {
  const { title, description } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(
      "invalid inputs passed , so cannot update the place",
      422
    ));
  }
  const placeId = req.params.placeId;
  let place;
 try{
   place=await placeModel.findById(placeId).exec();

 }catch(error){
   return next(new HttpError(
      "failed to update,try again",
      500
    ));
 }
  
  if (!place) {
    
    return next(new HttpError("place with that id was not found", 404));
  }
  if(place.owner.toString()!==req.userData.userId){
    return next(new HttpError('you are not allowed to edit this place', 401))
  }
  place.title=title;
  place.description=description;
  try{
    await place.save();
  }catch(error){
    return next(new HttpError(
      "failed to update,try again",
      500
    ));
  }
  res
    .status(200)
    .json({place:place.toObject({getters:true})});
};

const deletePlace = async(req, res, next) => {
  const placeId = req.params.placeId;
  let place;
  try{
    place=await placeModel.findById(placeId).populate('owner');
  }catch(error){
    
    return next(new HttpError('somewhing went wromg couldnot delete place',500))
  }
   if(!place){
     return next(new HttpError('couldnot find place with id',404));
   }
   if(place.owner.id!==req.userData.userId){
    return next(new HttpError('you are not allowed to delete this place', 403))
  }
   const imagePath=place.image;
  try{
      const sess=await mongoose.startSession();
      sess.startTransaction();
      await place.remove({session:sess});
      place.owner.places.remove(place);
      await place.owner.save({session:sess});
      await sess.commitTransaction();
  }catch(error){
    return next(new HttpError('somewhing went wrong',500))
  }
  fs.unlink(imagePath,(err)=>{
    console.log(err)
  });
  res.status(200).json({ message: "place successfully deleted" });
};

module.exports = {
  getPlaceById,
  getPlaceByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
