import * as db from "../utils/db";
import { NetworkCode, NetworkReturn } from "../utils/network";
import { TestModel, VESSEL_PROJECT, VesselModel } from "./OrcaSchema";

export const helloWorldHelper = async (data: {}): Promise<NetworkReturn> => {
  // Add to the test schema
  const response = await db.addItemToDb(TestModel, {
    test: "Hello World",
  });

  console.log("Response from db", response);

  return {
    code: NetworkCode.OK,
    data: {
      message: "Hello World",
      data: data,
    },
  };
};

export const getVesselsHelper = async (data: {
  bbox: string[];
}): Promise<NetworkReturn> => {
  // Validate the bbox
  if (!data.bbox || data.bbox.length !== 4) {
    return {
      code: NetworkCode.BAD_REQUEST,
      data: {
        message: "Invalid bounding box",
      },
    };
  }
  const bbox = data.bbox.map((coord) => parseFloat(coord));
  if (bbox.some(isNaN)) {
    return {
      code: NetworkCode.BAD_REQUEST,
      data: {
        message: "Invalid bounding box",
      },
    };
  }

  // As per requirements, only get vessels that have been updated with the last 2 minutes
  const twoMinutesAgo = Date.now() - 2 * 60 * 1000;

  // Get the vessels in the bounding box
  const vessels = await db.executeAggregateFromDb(VesselModel, {
    match: {
      location: {
        $geoWithin: {
          $box: [
            [bbox[0], bbox[1]], // southwest corner
            [bbox[2], bbox[3]], // northeast corner
          ],
        },
      },
      updatedAt: { $gte: twoMinutesAgo },
    },
    project: VESSEL_PROJECT,
  });

  // console.log("Vessels in bbox", vessels);

  if (!Array.isArray(vessels)) {
    return {
      code: NetworkCode.INTERNAL_SERVER_ERROR,
      data: {
        message: "Error getting vessels in bounding box",
      },
    };
  }

  const geoJSONFormat = vessels.map((vessel) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [vessel.lon, vessel.lat],
    },
    properties: {
      mmsi: vessel.mmsi,
      name: vessel.name,
      heading: vessel.heading,
      course: vessel.course,
      speed: vessel.speed,
      status: vessel.status,
      createdAt: vessel.createdAt,
      updatedAt: vessel.updatedAt,
    },
  }));

  return {
    code: NetworkCode.OK,
    data: {
      message: "All vessels in bounding box found",
      vessels,
      vesselGeoJSON: {
        type: "FeatureCollection",
        features: geoJSONFormat,
      },
    },
  };
};
