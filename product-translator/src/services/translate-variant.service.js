import {
  defineSourceLanguage,
  getLanguageName,
} from "../utils/languages.utils.js";
import { transformProductAttributeToString } from "../mappers/products.mapper.js";
import { executeTranslation } from "../externals/openai.client.js";
import { isEmptyObj } from "../utils/objects.utils.js";

async function translateStringTypeAttribute(
  variantAttributeValue,
  targetLanguageNames,
  sourceLanguageCode,
) {
  // Obtain the language name based on given language code for AI prompt. e.g. en_GB => English
  const sourceLanguageName = getLanguageName(sourceLanguageCode);

  const translationString = transformProductAttributeToString(
    variantAttributeValue,
    sourceLanguageCode,
  );

  // Translate the product fields into multiple languages and put result into a map as follow pattern
  // e.g
  // { english : 'Good Morning', german: 'Guten Tag' }
  let translationResult = {};
  if (translationString) {
    for (const targetLanguageName of targetLanguageNames) {
      const translatedString = await executeTranslation(
        translationString,
        sourceLanguageName,
        targetLanguageName,
      );
      translationResult[targetLanguageName] = translatedString;
    }
    translationResult[sourceLanguageName] = translationString;
  }
  if (isEmptyObj(translationResult)) return undefined;
  return translationResult;
}

async function translate(
  product,
  languagesInProject,
  localizedStringAttributeNames,
) {
  // Determine the source language by product name for translation purpose
  const sourceLanguageCode = defineSourceLanguage(product, languagesInProject);

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

  let variants = [];
  variants.push(product.masterData.staged.masterVariant);
  if (product.masterData.staged.variants.length > 0)
    variants.push(product.masterData.staged.variants);
  variants = variants.flat(Infinity);

  let translationResult;
  const translationResults = [];
  for (const variant of variants) {
    translationResult = {};
    for (const localizedStringAttributeName of localizedStringAttributeNames) {
      let filteredVariantAttributes = variant?.attributes.filter(
        (attribute) => attribute.name === localizedStringAttributeName,
      );
      let variantAttributeValue = filteredVariantAttributes.map(
        (attribute) => attribute.value,
      )[0];

      if (Array.isArray(variantAttributeValue)) {
        // TODO : translate Set type attribute
      } else {
        const result = await translateStringTypeAttribute(
          variantAttributeValue,
          targetLanguageNames,
          sourceLanguageCode,
        );
        translationResult.variantId = variant.id;
        translationResult[localizedStringAttributeName] = result;
      }
    }
    translationResults.push(translationResult);
  }

  return translationResults;
}

export { translate };
