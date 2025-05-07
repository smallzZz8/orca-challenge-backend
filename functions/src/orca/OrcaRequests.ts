import { APP } from "..";
import { sendResponse } from "../utils/responses";
import { getVesselsHelper, helloWorldHelper } from "./OrcaHelpers";

APP.get("/hello", async (req: { body: any; query: any }, res: any) => {
  const data: any = {};
  await sendResponse(res, helloWorldHelper(data));
});

// GET endpoint to take in a bounding box and return the vessels in that bounding box
APP.get("/vessels", async (req: { body: any; query: any }, res: any) => {
  const { bbox } = req.query;
  // Unencode the bbox
  const bboxArray = bbox.split(",").map(Number);

  const data: any = {
    bbox: bboxArray,
  };
  await sendResponse(res, getVesselsHelper(data));
});
