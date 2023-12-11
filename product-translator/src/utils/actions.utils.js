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

export { buildUpdateActions };
