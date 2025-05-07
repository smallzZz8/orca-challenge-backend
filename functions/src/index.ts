import express from "express";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import setupBackend from "./utils/setupBackend";
const cors = require("cors");

export let APP: express.Express;
export let globalVerboseLogging: boolean = false;

admin.initializeApp();

// Configure firestore
admin.firestore().settings({
  ignoreUndefinedProperties: true,
});

// Setup functions
functions.onInit(async () => {
  await setupBackend();
});

// initialize express server yarn
APP = express();
APP.use(cors({ origin: true }));

exports.webApi = functions.https.onRequest(APP);

export * from "./orca/OrcaRequests";
