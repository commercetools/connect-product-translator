import { createApiRoot } from "./create.client.js";
import CustomError from "../errors/custom.error.js";
import { HTTP_STATUS_SUCCESS_ACCEPTED } from "../constants/http-status.constants.js";

export async function getProductById(productId) {
  return await createApiRoot()
    .products()
    .withId({
      ID: Buffer.from(productId).toString(),
    })
    .get()
    .execute()
    .then((response) => response.body)
    .catch((error) => {
      throw new CustomError(HTTP_STATUS_SUCCESS_ACCEPTED, error.message, error);
    });
}

export async function updateProduct(product, updateActions) {
  return await createApiRoot()
    .products()
    .withId({
      ID: Buffer.from(product.id).toString(),
    })
    .post({
      body: {
        version: product.version,
        actions: updateActions,
      },
    })
    .execute()
    .then((response) => response.body)
    .catch((error) => {
      throw new CustomError(HTTP_STATUS_SUCCESS_ACCEPTED, error.message, error);
    });
}

export async function updateProductState(product, stateKey) {
  return await createApiRoot()
    .products()
    .withId({
      ID: Buffer.from(product.id).toString(),
    })
    .post({
      body: {
        version: product.version,
        actions: [
          {
            action: "transitionState",
            state: {
              typeId: "state",
              key: stateKey,
            },
          },
        ],
      },
    })
    .execute()
    .then((response) => response.body)
    .catch((error) => {
      throw new CustomError(HTTP_STATUS_SUCCESS_ACCEPTED, error.message, error);
    });
}
