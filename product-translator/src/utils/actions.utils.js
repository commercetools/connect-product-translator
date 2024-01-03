import { getLanguageName } from "./languages.utils.js";
import { TRANSLATION_FIELD_POS } from "../constants/translation.constants.js";
import { isEmptyObj } from "./objects.utils.js";

function getUpdatedLocalizedString(languagesInProject, translationResult, pos) {
  const value = {};
  for (const language of languagesInProject) {
    const languageName = getLanguageName(language);
    const translatedString = translationResult?.[languageName];
    if (translatedString) {
      const translatedProductName = translatedString.split("|")[pos];
      value[language] = translatedProductName;
    }
  }
  return value;
}

function transformVariantTranslationResult(
  languagesInProject,
  translatedAttributeResult,
) {
  let value = {};

  /** translatedAttributeResult = {
    German: [ 'rotes Auto', 'blaues Auto' ],
    English: [ 'blue car', 'red car' ]
  }
  **/
  console.log("--- translatedAttributeResult ---");
  console.log(translatedAttributeResult);
  for (const language of languagesInProject) {
    const languageName = getLanguageName(language);
    const translatedValue = translatedAttributeResult?.[languageName];

    if (translatedValue) {
      value[language] = translatedValue;
    }
    console.log("--- Translated Value ---");
    console.log(translatedValue);
    console.log(Array.isArray(translatedValue));
  }
  /** value = {
    de-DE : rotes Auto,blaues Auto
    en-GB : blue car,red car
    en-US : blue car,red car
  } **/

  /** typeValue =
   * [
      {
        "en-GB": "red car",
        "en-US": "red car",
        "de-DE": "rotes Auto"
      },
      {
        "en-GB": "blue car"
        "en-US": "blue car",
        "de-DE": "blaues Auto"
      }
   ]
   * @type {number}
   */
  let sizeOfSetTypeAttribute = value[languagesInProject[0]].length;
  // for (const countryCode in value) {
  //   console.log('--- countryCode ---')
  //   console.log(countryCode)
  //   sizeOfSetTypeAttribute = value[countryCode].length
  // }
  console.log("--- sizeOfSetTypeAttribute ---");
  console.log(sizeOfSetTypeAttribute);
  let attrValues = [];
  for (let idx = 0; idx < sizeOfSetTypeAttribute; ++idx) {
    const attrValue = {};
    for (const countryCode in value) {
      attrValue[countryCode] = value[countryCode][idx];
    }
    console.log(attrValue);
    attrValues.push(attrValue);
  }
  console.log("--- attrValues ---");
  console.log(attrValues);
  return attrValues;
}

function buildChangeNameUpdateAction(
  product,
  languagesInProject,
  translationResult,
) {
  const name = getUpdatedLocalizedString(
    languagesInProject,
    translationResult,
    TRANSLATION_FIELD_POS.NAME,
  );
  const updateAction = {
    action: "changeName",
    name,
  };

  return updateAction;
}

function buildSetDescUpdateAction(
  product,
  languagesInProject,
  translationResult,
) {
  const description = getUpdatedLocalizedString(
    languagesInProject,
    translationResult,
    TRANSLATION_FIELD_POS.DESCRIPTION,
  );
  const updateAction = {
    action: "setDescription",
    description,
  };
  return updateAction;
}

function buildSetMetaDescUpdateAction(
  product,
  languagesInProject,
  translationResult,
) {
  const metaDescription = getUpdatedLocalizedString(
    languagesInProject,
    translationResult,
    TRANSLATION_FIELD_POS.META_DESCRIPTION,
  );
  const updateAction = {
    action: "setMetaDescription",
    metaDescription,
  };
  return updateAction;
}

function buildSetMetaTitleUpdateAction(
  product,
  languagesInProject,
  translationResult,
) {
  const metaTitle = getUpdatedLocalizedString(
    languagesInProject,
    translationResult,
    TRANSLATION_FIELD_POS.META_TITLE,
  );
  const updateAction = {
    action: "setMetaTitle",
    metaTitle,
  };
  return updateAction;
}

function buildSetMetaKeywordsUpdateAction(
  product,
  languagesInProject,
  translationResult,
) {
  const metaKeywords = getUpdatedLocalizedString(
    languagesInProject,
    translationResult,
    TRANSLATION_FIELD_POS.META_KEYWORDS,
  );
  const updateAction = {
    action: "setMetaKeywords",
    metaKeywords,
  };
  return updateAction;
}

function buildSetAttributeUpdateActions(
  product,
  languagesInProject,
  translationResult,
  localizedStringAttributeNames,
) {
  const updateActions = [];
  const masterVariant = product.masterData.staged.masterVariant;

  for (const localizedStringAttributeName of localizedStringAttributeNames) {
    const value = {};
    for (const language of languagesInProject) {
      const languageName = getLanguageName(language);
      const translatedString =
        translationResult?.[localizedStringAttributeName]?.[languageName];
      if (translatedString) {
        value[language] = translatedString;
      }
    }
    if (!isEmptyObj(value)) {
      console.log(`${localizedStringAttributeName} : ${JSON.stringify(value)}`);

      const updateAction = {
        action: "setAttribute",
        variantId: masterVariant.id,
        name: localizedStringAttributeName,
        value,
      };
      updateActions.push(updateAction);
    }
  }

  return updateActions;
}

function buildUpdateActions(product, languagesInProject, translationResult) {
  const updateActions = [];
  updateActions.push(
    buildChangeNameUpdateAction(product, languagesInProject, translationResult),
  );
  updateActions.push(
    buildSetDescUpdateAction(product, languagesInProject, translationResult),
  );
  updateActions.push(
    buildSetMetaDescUpdateAction(
      product,
      languagesInProject,
      translationResult,
    ),
  );
  updateActions.push(
    buildSetMetaTitleUpdateAction(
      product,
      languagesInProject,
      translationResult,
    ),
  );
  updateActions.push(
    buildSetMetaKeywordsUpdateAction(
      product,
      languagesInProject,
      translationResult,
    ),
  );
  return updateActions;
}

export { buildUpdateActions, buildSetAttributeUpdateActions };
