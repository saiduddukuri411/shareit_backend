const express = require("express");
const app = express();
const router = express.Router();
const fileUploader = require("../Ownmiddleware/file-upload");
const checkAuth=require('../Ownmiddleware/tokenChecker');
const { check } = require("express-validator");
const {
  getPlaceById,
  getPlaceByUserId,
  createPlace,
  updatePlace,
  deletePlace,
} = require("../Controllers/placesController");
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

router.get("/:placeid", getPlaceById);

router.get("/:userId/places", getPlaceByUserId);

router.use(checkAuth);

router.post(
  "/",
  fileUploader.single("image"),
  [
    check("title").not().isEmpty(),
    check("title").isLength({ max: 16 }),
    check("description").isLength({ min: 20 }),
    check("address").not().isEmpty(),
  ],
  createPlace
);

router.patch(
  "/:placeId",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 20 }),
    check("description").isLength({ max: 450 }),
  ],
  updatePlace
);
router.delete("/:placeId", deletePlace);

module.exports = { router };
