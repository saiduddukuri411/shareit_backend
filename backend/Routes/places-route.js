const express = require("express");
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
