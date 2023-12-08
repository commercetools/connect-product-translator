import { getLanguageName } from "./languages.utils.js";
import { TRANSLATION_FIELD_POS } from "../constants/translation.constants.js";

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

function buildSetProductNameUpdateAction(
  product,
  languagesInProject,
  translationResult,
) {
  const name = getUpdatedLocalizedString(
    languagesInProject,
    translationResult,
    TRANSLATION_FIELD_POS.NAME,
  );
  const updateAction = [
    {
      action: "changeName",
      name,
    },
  ];

  return updateAction;
}

function buildUpdateActions(product, languagesInProject, translationResult) {
  return buildSetProductNameUpdateAction(
    product,
    languagesInProject,
    translationResult,
  );
}

export { buildUpdateActions };
