const PRODUCT_REQUEST_TRANSLATION_STATE_SUBSCRIPTION =
  "ct-connect-product-request-translation-state-subscription";

export async function deleteState(apiRoot, stateKey) {
  const {
    body: { results: states },
  } = await apiRoot
    .states()
    .get({
      queryArgs: {
        where: `key = "${stateKey}"`,
      },
    })
    .execute();

  if (states.length > 0) {
    const state = states[0];

    await apiRoot
      .states()
      .withKey({ key: stateKey })
      .delete({
        queryArgs: {
          version: state.version,
        },
      })
      .execute();
  }
}

export async function createState(apiRoot, stateKey) {
  await deleteState(apiRoot, stateKey);
  await apiRoot
    .states()
    .post({
      body: {
        key: stateKey,
        name: { en: stateKey },
        type: "ProductState",
        roles: [],
        initial: true,
      },
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
