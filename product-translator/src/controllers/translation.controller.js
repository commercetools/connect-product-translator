import { logger } from "../utils/logger.utils.js";
import {
  HTTP_STATUS_SERVER_ERROR,
  HTTP_STATUS_SUCCESS_NO_CONTENT,
} from "../constants/http-status.constants.js";
import {
  validateRequest,
  isRequestTranslationStateMessage,
} from "../validators/message.validators.js";
import { decodeToJson } from "../utils/decoder.utils.js";
import { translate as translateProduct } from "../services/translate-product.service.js";
import { translate as translateVariant } from "../services/translate-variant.service.js";

import { getLanguages } from "../client/languages.client.js";
import { updateProduct } from "../client/products.client.js";

import { getProductById } from "../client/products.client.js";
import { updateProductState } from "../client/products.client.js";
import { STATES } from "../constants/states.constants.js";
import {
  buildUpdateActions,
  buildSetAttributeUpdateActions,
} from "../utils/actions.utils.js";

function getLocalizedStringAttributeNames(product) {
  const attributeDefinitions = product.productType.obj?.attributes;
  const localizedStringAttributeNames = attributeDefinitions
    .filter((attributeDefinition) => {
      return (
        attributeDefinition?.type?.name === "ltext" ||
        (attributeDefinition?.type?.name === "set" &&
          attributeDefinition?.type?.elementType?.name === "ltext")
      );
    })
    .map((attributeDefinition) => attributeDefinition.name);

  return localizedStringAttributeNames;
}

async function translationHandler(request, response) {
  let originalProduct, updatedProduct;
  try {
    logger.info("Received product state changed message.");

    // Validate request and incoming message
    validateRequest(request);

    // Receive the Pub/Sub message
    const encodedPubSubMessage = request.body.message.data;
    const pubSubMessage = decodeToJson(encodedPubSubMessage);
    logger.info(JSON.stringify(pubSubMessage));

    // Skip handling non-translation state
    const isRequestTranslationState =
      await isRequestTranslationStateMessage(pubSubMessage);
    if (!isRequestTranslationState)
      return response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();

    const productId = pubSubMessage.resource.id;
    originalProduct = await getProductById(productId);

    // Change product state to 'translation in process'
    updatedProduct = await updateProductState(
      originalProduct,
      STATES.TRANSLATION_IN_PROCESS,
    );

    // Obtain the list of languages supported by current CT project
    const languagesInProject = await getLanguages();

    // Perform translation for localized strings inside product over different languages
    const translationResult = await translateProduct(
      updatedProduct,
      languagesInProject,
    );
    let updateActions = buildUpdateActions(
      updatedProduct,
      languagesInProject,
      translationResult,
    );

    const localizedStringAttributeNames =
      getLocalizedStringAttributeNames(originalProduct);

    const variantTranslationResult = await translateVariant(
      updatedProduct,
      languagesInProject,
      localizedStringAttributeNames,
    );

    const setAttributeUpdateActions = buildSetAttributeUpdateActions(
      updatedProduct,
      languagesInProject,
      variantTranslationResult,
      localizedStringAttributeNames,
    );
    updateActions.push(setAttributeUpdateActions);
    updateActions = updateActions.flat(Infinity);
    updatedProduct = await updateProduct(updatedProduct, updateActions);

    await updateProductState(updatedProduct, STATES.TRANSLATED);
  } catch (err) {
    logger.error(err);
    try {
      await updateProductState(updatedProduct, STATES.TRANSLATION_FAILED);
    } catch (updateProductStateError) {
      logger.error(updateProductStateError);
    }
    if (err.statusCode) return response.status(err.statusCode).send(err);
    return response.status(HTTP_STATUS_SERVER_ERROR).send(err);
  }

  // Return the response for the client
  return response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
}

export { translationHandler };
