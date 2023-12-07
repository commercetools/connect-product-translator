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
import { transformProductToString } from "../mappers/products.mapper.js";
import {
  retrieveProduct,
  changeProductToTranslationInProgressState,
} from "../services/product.service.js";
import { getLanguages } from "../client/languages.client.js";

export const translationHandler = async (request, response) => {
  try {
    logger.info("Received product state changed message.");
    validateRequest(request);

    // Receive the Pub/Sub message
    const encodedPubSubMessage = request.body.message.data;
    const pubSubMessage = decodeToJson(encodedPubSubMessage);
    logger.info(JSON.stringify(pubSubMessage));
    const isRequestTranslationState =
      await isRequestTranslationStateMessage(pubSubMessage);

    if (isRequestTranslationState) {
      const product = await retrieveProduct(pubSubMessage);
      await changeProductToTranslationInProgressState(product);
      const languages = await getLanguages();
      const translationString = transformProductToString(product, languages);
      logger.info(JSON.stringify(translationString));

      // TODO
      //  1. Send translationString to OpenAI
      //  2. Place the result to those localized Strings in the product
    }
  } catch (err) {
    logger.error(err);
    if (err.statusCode) return response.status(err.statusCode).send(err);
    return response.status(HTTP_STATUS_SERVER_ERROR).send(err);
  }

  // Return the response for the client
  return response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
};
