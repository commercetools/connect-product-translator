import { PRODUCT_REQUEST_TRANSLATION_STATE_SUBSCRIPTION } from "../constants.js";

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
