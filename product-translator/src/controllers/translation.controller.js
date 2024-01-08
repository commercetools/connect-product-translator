import { logger } from "../utils/logger.utils.js";
import {
  HTTP_STATUS_SUCCESS_NO_CONTENT,
  HTTP_STATUS_SUCCESS_ACCEPTED,
} from "../constants/http-status.constants.js";
import {
  validateRequest,
  isRequestTranslationStateMessage,
} from "../validators/message.validators.js";
import { decodeToJson } from "../utils/decoder.utils.js";
import { processTranslation as translateProduct } from "../services/translate-product.service.js";
import { processTranslation as translateVariant } from "../services/translate-variant.service.js";

import { getLanguages } from "../client/languages.client.js";
import { updateProduct } from "../client/products.client.js";

import { getProductById } from "../client/products.client.js";
import { updateProductState } from "../client/products.client.js";
import { STATES } from "../constants/states.constants.js";

import { getLocalizedStringAttributeNames } from "../utils/product.utils.js";

async function translationHandler(request, response) {
  let originalProduct, updatedProduct;
  try {
    logger.info("Received product state changed message.");

    // Validate request and incoming message
    validateRequest(request);

    // Receive the Pub/Sub message
    const encodedPubSubMessage = request.body.message.data;
    const pubSubMessage = decodeToJson(encodedPubSubMessage);

    // Skip handling non-translation state
    const isRequestTranslationState =
      await isRequestTranslationStateMessage(pubSubMessage);
    if (!isRequestTranslationState)
      return response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();

    const productId = pubSubMessage.resource.id;
    originalProduct = await getProductById(productId);
    const localizedStringAttributeNames =
      getLocalizedStringAttributeNames(originalProduct);

    // Change product state to 'translation in process'
    updatedProduct = await updateProductState(
      originalProduct,
      STATES.TRANSLATION_IN_PROCESS,
    );

    logger.info(
      "Product is in translation process. Acknowledgment is sent back to pub/sub.",
    );
    response.status(HTTP_STATUS_SUCCESS_ACCEPTED).send();

    // Obtain the list of languages supported by current CT project
    const languagesInProject = await getLanguages();

    // Perform translation for localized strings inside product and its variants over different languages
    let [productUpdateActions, variantsUpdateActions] = await Promise.all([
      translateProduct(updatedProduct, languagesInProject),
      translateVariant(
        updatedProduct,
        languagesInProject,
        localizedStringAttributeNames,
      ),
    ]);

    productUpdateActions.push(variantsUpdateActions);
    productUpdateActions = productUpdateActions.flat(Infinity);
    updatedProduct = await updateProduct(updatedProduct, productUpdateActions);

    await updateProductState(updatedProduct, STATES.TRANSLATED);
    logger.info(`Translation product ${updatedProduct.id} completed.`);
  } catch (err) {
    logger.error(err);
    if (updatedProduct) {
      try {
        await updateProductState(updatedProduct, STATES.TRANSLATION_FAILED);
      } catch (updateProductStateError) {
        logger.error(updateProductStateError);
      }
    } else {
      return response.status(err.statusCode).send();
    }
  }
}

export { translationHandler };
