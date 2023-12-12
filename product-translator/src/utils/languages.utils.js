import { LANGUAGES } from "../constants/languages.constants.js";
import { logger } from "./logger.utils.js";

const defineSourceLanguage = (product, languages) => {
  const productName = product.masterData.staged.name;

  let primaryLang = undefined;
  languages.forEach((language) => {
    if (productName[language] && !primaryLang) primaryLang = language;
  });

  return primaryLang;
};

const getLanguageName = (locale) => {
  let languageName;
  if (locale.length < 2) {
    logger.error(`Incorrect locale : ${locale}`);
  } else {
    const languageCode = locale.substring(0, 2);
    languageName = LANGUAGES[languageCode];
  }
  return languageName;
};

export { defineSourceLanguage, getLanguageName };
