import _ from "lodash";

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

function transformTransitionIdToKey(transitions) {
  let existingStateTransitionsWithKey = transitions.map((transition) => {
    return {
      typeId: transition.typeId,
      key: transition?.obj.key,
    };
  });
  return existingStateTransitionsWithKey;
}
function buildUpdateActions(existingState, stateDraft) {
  const actions = [];
  if (existingState.transitions)
    existingState.transitions = transformTransitionIdToKey(
      existingState.transitions,
    );
  if (!_.isEqual(existingState.transitions, stateDraft.transitions))
    actions.push({
      action: "setTransitions",
      transitions: stateDraft.transitions,
    });

  return actions;
}

async function updateState(apiRoot, existingState, stateDraft) {
  const updateActions = buildUpdateActions(existingState, stateDraft);

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
