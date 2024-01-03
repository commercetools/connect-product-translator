import {
  defineSourceLanguage,
  getLanguageName,
} from "../utils/languages.utils.js";
import { transformProductAttributeToString } from "../mappers/products.mapper.js";
import {
  translateDummySetTypeAttribute,
  translate,
} from "../externals/openai.client.js";
import { isEmptyObj } from "../utils/objects.utils.js";

async function translateSetTypeAttribute(
  variantAttributeValue,
  targetLanguageNames,
  sourceLanguageCode,
) {
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
    const translatedString = await translate(
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
  if (translationString) {
    for (const targetLanguageName of targetLanguageNames) {
      const translatedString = await translate(
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
      // TODO : fake AI call
      // const result = await translateStringTypeAttribute(
      //   masterVariantAttributeValue,
      //   targetLanguageNames,
      //   sourceLanguageCode,
      // );
      const result = "";
      translationResult[localizedStringAttributeName] = result;
    }
  }
  console.log("--- translationResult ---");
  console.log(translationResult);
  const fakeTranslationResult = {
    productspec: undefined,
    color: { German: "rot", English: "red" },
    finish: undefined,
    colorlabel: undefined,
    finishlabel: undefined,
    size: { German: "groß", English: "big" },
    "product-description": undefined,
  };

  return fakeTranslationResult;
}

export { translateVariant };
