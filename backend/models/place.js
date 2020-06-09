const mongoose = require("mongoose");

const schema = mongoose.Schema;

const placeSchema = new schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  description: { type: String, min: 20, max: 350 },
  owner: { type: mongoose.Types.ObjectId, required: true, ref:'User' },
});

const placeModel = mongoose.model("Place", placeSchema);
module.exports = { placeModel };
