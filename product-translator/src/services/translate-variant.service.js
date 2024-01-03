import {
  defineSourceLanguage,
  getLanguageName,
} from "../utils/languages.utils.js";
import { transformProductAttributeToString } from "../mappers/products.mapper.js";
import { translateDummySetTypeAttribute } from "../externals/openai.client.js";

async function translateSetTypeAttribute(
  variantAttributeValue,
  targetLanguageNames,
  sourceLanguageCode,
) {
  console.log("translateSetTypeAttribute()");
  // Obtain the language name based on given language code for AI prompt. e.g. en_GB => English
  const sourceLanguageName = getLanguageName(sourceLanguageCode);

  const translationList = transformProductAttributeToString(
    variantAttributeValue,
    sourceLanguageCode,
  );

  // Translate the product fields into multiple languages and put result into a map as follow pattern
  // e.g
  // { english : 'Good Morning', german: 'Guten Tag' }
  const translationString = translationList.join("|");

  let translationResult = {};
  for (const targetLanguageName of targetLanguageNames) {
    const translatedString = await translateDummySetTypeAttribute(
      translationString,
      sourceLanguageName,
      targetLanguageName,
    );

    translationResult[targetLanguageName] = translatedString.split("|");
  }
  translationResult[sourceLanguageName] = translationList;
  return translationResult;
}

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
  for (const targetLanguageName of targetLanguageNames) {
    // const translatedString = await translate(
    //     translationString,
    //     sourceLanguageName,
    //     targetLanguageName,
    // );
    const translatedString = "";

    translationResult[targetLanguageName] = translatedString;
  }
  translationResult[sourceLanguageName] = translationString;
}

async function translateVariant(
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

  const masterVariant = product.masterData.staged.masterVariant;
  const variants = product.masterData.staged.variants;
  const translationResult = {};
  const translationResults = [];
  for (const localizedStringAttributeName of localizedStringAttributeNames) {
    let filteredMasterVariantAttributes = masterVariant?.attributes.filter(
      (attribute) => attribute.name === localizedStringAttributeName,
    );
    let masterVariantAttributeValue = filteredMasterVariantAttributes.map(
      (attribute) => attribute.value,
    )[0];

    if (Array.isArray(masterVariantAttributeValue)) {
      const result = await translateSetTypeAttribute(
        masterVariantAttributeValue,
        targetLanguageNames,
        sourceLanguageCode,
      );
      translationResult[localizedStringAttributeName] = result;
    } else {
      const result = await translateStringTypeAttribute(
        masterVariantAttributeValue,
        targetLanguageNames,
        sourceLanguageCode,
      );
      translationResult[localizedStringAttributeName] = result;
    }
  }
  console.log(translationResult);
  return translationResult;
}

export { translateVariant };
