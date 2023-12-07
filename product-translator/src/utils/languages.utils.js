import { LANGUAGES } from "../constants/languages.constants.js";
import { logger } from "./logger.utils.js";

const getPrimaryLang = (product, languages) => {
  const productName = product.masterData.staged.name;

  let primaryLang = undefined;
  languages.forEach((language) => {
    if (productName[language] && !primaryLang) primaryLang = language;
  });

  return primaryLang;
};

const getLanguageName = (language) => {
  let languageName;
  if (language.length < 2) {
    logger.error(`Incorrect language : ${language}`);
  } else {
    const languageCode = language.substring(0, 2);
    languageName = LANGUAGES[languageCode];
  }
  return languageName;
};

export { getPrimaryLang, getLanguageName };
