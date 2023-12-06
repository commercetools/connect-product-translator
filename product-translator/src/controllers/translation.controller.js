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
import { STATES } from "../constants/states.constants.js";
import {
  getProductById,
  updateProductState,
} from "../client/products.client.js";

const changeProductToTranslationInProgressState = async (product) => {
  await updateProductState(product, STATES.TRANSLATION_IN_PROCESS);
};

const retrieveProduct = async (pubSubMessage) => {
  const productId = pubSubMessage.resource.id;
  const product = await getProductById(productId);
  return product;
};

const getLanguageList = (product) => {
  // TODO :
  //  1. Check product name, assuming only 1 locale has been initialized with value. If more than 1 initialized locale, assuming the higher in alphabetical order is the source of translation language.
  //  2. Map the required languages by locale. e.g. if locales en_GB, de_CH, de_DE are involved, they will be mapped into language list ['german'] excluding the source locale en_GB.
  return product;
};

const transformProductToString = (product) => {
  // TODO :
  //  1. Based on the value from source locale, convert various product attributes into a single line per locale in following pattern
  //  name|slug|metaTitle|[attributeValue1,attributeValue2, attributeLabel3, ...]
  return product;
};

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
      const languageList = getLanguageList(product);
      const translationString = transformProductToString(product);
      logger.info(languageList);
      logger.info(translationString);
    }
  } catch (err) {
    logger.error(err);
    if (err.statusCode) return response.status(err.statusCode).send(err);
    return response.status(HTTP_STATUS_SERVER_ERROR).send(err);
  }

  // Return the response for the client
  return response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
};
