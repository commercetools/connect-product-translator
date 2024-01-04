import {
  defineSourceLanguage,
  getLanguageName,
} from "../utils/languages.utils.js";
import { transformProductToString } from "../mappers/products.mapper.js";
import { executeTranslation } from "../externals/openai.client.js";
import { buildUpdateActions } from "../utils/actions.utils.js";

/**
 *
 * @param product - product with translation in process state
 * @param languagesInProject - language code supported by current CT project
 * @returns updateActions - A list of updateAction containing the translated string
 */
async function processTranslation(product, languagesInProject) {
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
    const translatedString = await executeTranslation(
      translationString,
      sourceLanguageName,
      targetLanguageName,
    );
    translationResult[targetLanguageName] = translatedString;
  }
  translationResult[sourceLanguageName] = translationString;
  let updateActions = buildUpdateActions(
    product,
    languagesInProject,
    translationResult,
  );
  return updateActions;
}
export { processTranslation };
