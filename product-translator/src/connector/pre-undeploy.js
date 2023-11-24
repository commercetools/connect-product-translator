import { createApiRoot } from "../client/create.client.js";
import { assertError } from "../utils/assert.utils.js";
import { deleteProductStateChangedSubscription } from "./actions/subscription-actions.js";

async function preUndeploy() {
  const apiRoot = createApiRoot();
  await deleteProductStateChangedSubscription(apiRoot);
}

async function run() {
  try {
    await preUndeploy();
  } catch (error) {
    assertError(error);
    process.stderr.write(`Post-undeploy failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

run();
