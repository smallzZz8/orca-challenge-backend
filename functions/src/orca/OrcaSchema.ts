import mongoose, { Schema } from "mongoose";

// Create a test collection
const testSchema = new Schema(
  {
    test: {
      type: String,
      required: true,
    },
  },
  {
    collection: "test",
    timestamps: true,
  }
);
export const TestModel = mongoose.model("test", testSchema);

export const VESSEL_PROJECT = {
  mmsi: 1,
  name: 1,
  lat: 1,
  lon: 1,
  course: 1,
  speed: 1,
  heading: 1,
  status: 1,
  createdAt: 1,
  updatedAt: 1,
  location: 1,
};

const vesselSchema = new Schema({
  mmsi: { type: Number, required: true, unique: true },
  name: { type: String },
  lat: { type: Number },
  lon: { type: Number },
  course: { type: Number },
  speed: { type: Number },
  heading: { type: Number },
  status: { type: Number },
  createdAt: { type: Number, default: Date.now() },
  updatedAt: { type: Number, default: Date.now() },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: "2dsphere",
      required: true,
    },
  },
});

vesselSchema.pre("save", function (next) {
  if (this.lat != null && this.lon != null) {
    this.location = {
      type: "Point",
      coordinates: [this.lon, this.lat],
    };
  }
  next();
});

// Create an index on location for 2dsphere queries
vesselSchema.index({ location: "2dsphere" });

export const VesselModel = mongoose.model("Vessel", vesselSchema);
