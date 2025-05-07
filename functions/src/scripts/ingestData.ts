import { VesselModel } from "../orca/OrcaSchema";
import setupBackend from "../utils/setupBackend";
const AIS_URL = "wss://stream.aisstream.io/v0/stream";
const API_KEY = process.env.AISSTREAM_API_KEY;

const ingestData = async () => {
  console.log("Start Ingesting data...");

  const WebSocket = require("ws");
  const socket = new WebSocket(AIS_URL);

  socket.on("open", () => {
    let subscription = {
      APIkey: API_KEY,
      BoundingBoxes: [
        [
          [-90, -180],
          [90, 180],
        ],
      ],
      FilterMessageTypes: ["PositionReport"],
    };
    socket.send(JSON.stringify(subscription));
  });

  socket.on("message", async (data: string) => {
    const parsedData = JSON.parse(data);
    // console.log("Received data:", parsedData);
    const meta = parsedData?.MetaData;

    const report = parsedData?.Message?.PositionReport;

    if (!report || !meta || !meta.latitude || !meta.longitude) {
      return;
    }

    const mmsi = meta.MMSI;
    const lat = meta.latitude;
    const lon = meta.longitude;
    // const timestamp = new Date(meta?.time_UTC);
    const timestamp = Date.now(); // Will use my own timestamp for the sake of the demo

    try {
      await VesselModel.findOneAndUpdate(
        { mmsi },
        {
          name: meta.ShipName?.trim(),
          lat,
          lon,
          course: report.Cog,
          speed: report.Sog,
          heading: report.TrueHeading,
          status: report.NavigationalStatus,
          updatedAt: timestamp,
          location: {
            type: "Point",
            coordinates: [lon, lat],
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (e) {
      console.error("Error upserting item in db", e);
    }
  });

  socket.on("error", (error: any) => {
    console.error("WebSocket error:", error);
  });

  socket.on("close", () => {
    console.log("WebSocket connection closed");
    // Reconnect
    setTimeout(() => {
      console.log("Reconnecting...");
      ingestData();
    }, 1000);
  });
};

setupBackend();
ingestData();
