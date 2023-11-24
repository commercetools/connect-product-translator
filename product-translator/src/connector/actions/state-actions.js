import { buildStateUpdateActions } from "../utils/connector-scripts-utils.js";

async function getStates(apiRoot, stateKey) {
  const {
    body: { results: states },
  } = await apiRoot
    .states()
    .get({
      queryArgs: {
        where: `key = "${stateKey}"`,
        expand: ["transitions[*]"],
      },
    })
    .execute();

  return states;
}

async function updateState(apiRoot, existingState, stateDraft) {
  const updateActions = buildStateUpdateActions(existingState, stateDraft);

  if (updateActions.length > 0) {
    await apiRoot
      .states()
      .withKey({ key: stateDraft.key })
      .post({
        body: {
          version: existingState.version,
          actions: updateActions,
        },
      })
      .execute();
  }
}

export async function createState(apiRoot, stateDraft) {
  const states = await getStates(apiRoot, stateDraft.key);

  if (states.length > 0) {
    const existingState = states[0];
    await updateState(apiRoot, existingState, stateDraft);
  } else {
    await apiRoot
      .states()
      .post({
        body: stateDraft,
      })
      .execute();
  }
}
