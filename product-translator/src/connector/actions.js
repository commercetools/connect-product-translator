const PRODUCT_REQUEST_TRANSLATION_STATE_SUBSCRIPTION =
  "ct-connect-product-request-translation-state-subscription";

export async function deleteState(apiRoot, stateDraft) {
  const {
    body: { results: states },
  } = await apiRoot
    .states()
    .get({
      queryArgs: {
        where: `key = "${stateDraft.key}"`,
      },
    })
    .execute();

  if (states.length > 0) {
    const state = states[0];

    await apiRoot
      .states()
      .withKey({ key: stateDraft.key })
      .delete({
        queryArgs: {
          version: state.version,
        },
      })
      .execute();
  }
}

export async function createState(apiRoot, stateDraft) {
  await deleteState(apiRoot, stateDraft);
  await apiRoot
    .states()
    .post({
      body: stateDraft,
    })
    .execute();
}
export async function createProductStateChangedSubscription(
  apiRoot,
  topicName,
  projectId,
) {
  await deleteProductStateChangedSubscription(apiRoot);

  await apiRoot
    .subscriptions()
    .post({
      body: {
        key: PRODUCT_REQUEST_TRANSLATION_STATE_SUBSCRIPTION,
        destination: {
          type: "GoogleCloudPubSub",
          topic: topicName,
          projectId,
        },
        messages: [
          {
            resourceTypeId: "product",
            types: ["ProductStateTransition"],
          },
        ],
      },
    })
    .execute();
}

export async function deleteProductStateChangedSubscription(apiRoot) {
  const {
    body: { results: subscriptions },
  } = await apiRoot
    .subscriptions()
    .get({
      queryArgs: {
        where: `key = "${PRODUCT_REQUEST_TRANSLATION_STATE_SUBSCRIPTION}"`,
      },
    })
    .execute();

  if (subscriptions.length > 0) {
    const subscription = subscriptions[0];

    await apiRoot
      .subscriptions()
      .withKey({ key: PRODUCT_REQUEST_TRANSLATION_STATE_SUBSCRIPTION })
      .delete({
        queryArgs: {
          version: subscription.version,
        },
      })
      .execute();
  }
}
