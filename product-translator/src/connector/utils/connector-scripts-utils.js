import _ from "lodash";

function transformTransitionIdToKey(transitions) {
  let existingStateTransitionsWithKey = transitions.map((transition) => {
    return {
      typeId: transition.typeId,
      key: transition?.obj.key,
    };
  });
  return existingStateTransitionsWithKey;
}
function buildStateUpdateActions(existingState, stateDraft) {
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

export { transformTransitionIdToKey, buildStateUpdateActions };
