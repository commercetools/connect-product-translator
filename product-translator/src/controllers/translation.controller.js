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
import { updateProduct } from "../client/products.client.js";
import { getPrimaryLang, getLanguageName } from "../utils/languages.utils.js";
import { dummyTranslation } from "../externals/openai.client.js";

const buildUpdateActionField = (languagesInProject, translationResult, pos) => {
  const field = {};
  for (const language of languagesInProject) {
    const languageName = getLanguageName(language);
    const translatedString = translationResult?.[languageName];
    if (translatedString) {
      const translatedProductName = translatedString.split("|")[pos];
      field[language] = translatedProductName;
    }
  }
  return field;
};

const buildSetProductNameUpdateAction = (
  product,
  languagesInProject,
  translationResult,
) => {
  const name = buildUpdateActionField(languagesInProject, translationResult, 0);
  const updateAction = [
    {
      action: "changeName",
      name,
    },
  ];

  return updateAction;
};

const buildUpdateActions = (product, languagesInProject, translationResult) => {
  return buildSetProductNameUpdateAction(
    product,
    languagesInProject,
    translationResult,
  );
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
      let product = await retrieveProduct(pubSubMessage);
      product = await changeProductToTranslationInProgressState(product);

      const languagesInProject = await getLanguages();

      // Determine the primary language from product name
      const primaryLanguage = getPrimaryLang(product, languagesInProject);
      const translationString = transformProductToString(
        product,
        primaryLanguage,
      );
      const sourceLanguageName = getLanguageName(primaryLanguage);
      let targetLanguageNames = languagesInProject
        .filter((language) => language !== primaryLanguage)
        .map((language) => getLanguageName(language));

      targetLanguageNames = targetLanguageNames.filter(
        (element, index) => targetLanguageNames.indexOf(element) === index,
      );
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

      const updateActions = buildUpdateActions(
        product,
        languagesInProject,
        translationResult,
      );
      await updateProduct(product, updateActions);
    }
  } catch (err) {
    logger.error(err);
    if (err.statusCode) return response.status(err.statusCode).send(err);
    return response.status(HTTP_STATUS_SERVER_ERROR).send(err);
  }

  // Return the response for the client
  return response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
};
