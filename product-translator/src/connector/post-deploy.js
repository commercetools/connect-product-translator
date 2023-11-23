import {
  initialStateDraft,
  requestTranslationStateDraft,
  translationInProgressStateDraft,
  translatedStateDraft,
  translationFailedStateDraft,
} from "./payloads/state-payload.js";

import { createApiRoot } from "../client/create.client.js";
import { assertError, assertString } from "../utils/assert.utils.js";
import { createState } from "./actions/state-actions.js";

import { createProductStateChangedSubscription } from "./actions/subscription-actions.js";

const CONNECT_GCP_TOPIC_NAME_KEY = "CONNECT_GCP_TOPIC_NAME";
const CONNECT_GCP_PROJECT_ID_KEY = "CONNECT_GCP_PROJECT_ID";

async function postDeploy(properties) {
  const topicName = properties.get(CONNECT_GCP_TOPIC_NAME_KEY);
  const projectId = properties.get(CONNECT_GCP_PROJECT_ID_KEY);

  assertString(topicName, CONNECT_GCP_TOPIC_NAME_KEY);
  assertString(projectId, CONNECT_GCP_PROJECT_ID_KEY);

  const apiRoot = createApiRoot();

  await createState(apiRoot, translationFailedStateDraft);
  await createState(apiRoot, translatedStateDraft);
  await createState(apiRoot, translationInProgressStateDraft);
  await createState(apiRoot, requestTranslationStateDraft);
  await createState(apiRoot, initialStateDraft);
  await createProductStateChangedSubscription(apiRoot, topicName, projectId);
}

async function run() {
  try {
    const properties = new Map(Object.entries(process.env));
    await postDeploy(properties);
  } catch (error) {
    assertError(error);
    process.stderr.write(`Post-deploy failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

run();
