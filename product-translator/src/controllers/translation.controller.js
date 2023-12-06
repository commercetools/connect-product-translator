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
import { getLanguages } from "../client/languages.client.js";
import { getPrimaryLang } from "../utils/languages.utils.js";
const changeProductToTranslationInProgressState = async (product) => {
  await updateProductState(product, STATES.TRANSLATION_IN_PROCESS);
};

const retrieveProduct = async (pubSubMessage) => {
  const productId = pubSubMessage.resource.id;
  const product = await getProductById(productId);

  return product;
};

const loadLanguageList = async () => {
  const languages = await getLanguages();
  return languages;
};

const transformProductToString = (product, languages) => {
  // Determine the primary language from product name
  const productName = product.masterData.staged.name;
  const primaryLanguage = getPrimaryLang(productName, languages);

  // Transform product into a single line in following pattern based on the value of primary language.
  // name|description|metaDescription|metaKeywords|metaTitle|slug
  const primaryProductName = productName[primaryLanguage];
  const primaryProductDescription =
    product.masterData.staged.description[primaryLanguage];
  const primaryProductMetaDescription =
    product.masterData.staged.metaDescription[primaryLanguage];
  const primaryProductMetaKeywords =
    product.masterData.staged.metaKeywords[primaryLanguage];
  const primaryProductMetaTitle =
    product.masterData.staged.metaTitle[primaryLanguage];
  const primaryProductSlug = product.masterData.staged.slug[primaryLanguage];

  // TODO
  //  1. Identify attributes from product type which belongs to localized String.
  //  2. Transform the product attributes into String.

  return `${primaryProductName}|${primaryProductDescription}|${primaryProductMetaDescription}|${primaryProductMetaKeywords}|${primaryProductMetaTitle}|${primaryProductSlug}`;
};

export const translationHandler = async (request, response) => {
  try {
    logger.info("Received product state changed message.");
    validateRequest(request);

    // Receive the Pub/Sub message
    const encodedPubSubMessage = request.body.message.data;
    const pubSubMessage = decodeToJson(encodedPubSubMessage);
    logger.info(JSON.stringify(pubSubMessage));
    const isRequestTranslationState = true;
    await isRequestTranslationStateMessage(pubSubMessage);

    if (isRequestTranslationState) {
      const product = await retrieveProduct(pubSubMessage);
      await changeProductToTranslationInProgressState(product);
      const languages = await loadLanguageList();
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
