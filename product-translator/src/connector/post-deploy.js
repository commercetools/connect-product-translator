import dotenv from "dotenv";
import {
  requestTranslationStatePayload,
  inTranslationStatePayload,
  translatedStatePayload,
  translationFailedStatePayload,
} from "./state-payload.js";
dotenv.config();

import { createApiRoot } from "../client/create.client.js";
import { assertError, assertString } from "../utils/assert.utils.js";
import {
  createState,
  createProductStateChangedSubscription,
} from "./actions.js";

const CONNECT_GCP_TOPIC_NAME_KEY = "CONNECT_GCP_TOPIC_NAME";
const CONNECT_GCP_PROJECT_ID_KEY = "CONNECT_GCP_PROJECT_ID";

async function postDeploy(properties) {
  const topicName = properties.get(CONNECT_GCP_TOPIC_NAME_KEY);
  const projectId = properties.get(CONNECT_GCP_PROJECT_ID_KEY);

  assertString(topicName, CONNECT_GCP_TOPIC_NAME_KEY);
  assertString(projectId, CONNECT_GCP_PROJECT_ID_KEY);

  const apiRoot = createApiRoot();

  await createState(apiRoot, translationFailedStatePayload);
  // await createProductStateChangedSubscription(apiRoot, topicName, projectId);
}

async function run() {
  try {
    const properties = new Map(Object.entries(process.env));
    await postDeploy(properties);
  } catch (error) {
    console.error(error);
    assertError(error);
    process.stderr.write(`Post-deploy failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

run();
