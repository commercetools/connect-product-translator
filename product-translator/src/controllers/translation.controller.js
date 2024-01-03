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
import { translateVariant } from "../services/translate-variant.service.js";
import { transformProductToString } from "../mappers/products.mapper.js";
import { getLanguages } from "../client/languages.client.js";
import { updateProduct } from "../client/products.client.js";
import {
  defineSourceLanguage,
  getLanguageName,
} from "../utils/languages.utils.js";
import { dummyTranslation } from "../externals/openai.client.js";
import { getProductById } from "../client/products.client.js";
import { updateProductState } from "../client/products.client.js";
import { STATES } from "../constants/states.constants.js";
import {
  buildUpdateActions,
  buildSetAttributeUpdateActions,
} from "../utils/actions.utils.js";

async function doTranslation(product, languagesInProject) {
  // Determine the source language by product name for translation purpose
  const sourceLanguageCode = defineSourceLanguage(product, languagesInProject);

  // Obtain the language name based on given language code for AI prompt. e.g. en_GB => English
  const sourceLanguageName = getLanguageName(sourceLanguageCode);

  // Transform product into a single line in based on the given language code.
  const translationString = transformProductToString(
    product,
    sourceLanguageCode,
  );

  // Define a list of language name to which the product fields are going to be translated
  // e.g. ['en_US', 'en_EN'] => ['English', 'English']
  let targetLanguageNames = languagesInProject
    .filter((language) => language !== sourceLanguageCode)
    .map((language) => getLanguageName(language));

  // Remove duplicated language names.
  // e.g. ['English', 'English'] => ['English']
  targetLanguageNames = targetLanguageNames.filter(
    (element, index) => targetLanguageNames.indexOf(element) === index,
  );

  // Translate the product fields into multiple languages and put result into a map as follow pattern
  // e.g
  // { english : 'Good Morning', german: 'Guten Tag' }
  const translationResult = {};
  for (const targetLanguageName of targetLanguageNames) {
    const translatedString = await dummyTranslation(
      translationString,
      sourceLanguageName,
      targetLanguageName,
    );
    translationResult[targetLanguageName] = translatedString;
  }
  translationResult[sourceLanguageName] = translationString;
  return translationResult;
}

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
    const translationResult = await doTranslation(
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
    console.log("--- variantTranslationResult ---");
    console.log(variantTranslationResult);

    const setAttributeUpdateActions = buildSetAttributeUpdateActions(
      updatedProduct,
      languagesInProject,
      variantTranslationResult,
      localizedStringAttributeNames,
    );
    updateActions.push(setAttributeUpdateActions);
    updateActions = updateActions.flat(Infinity);
    console.log("--- updateActions ---");
    console.log(updateActions);
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
