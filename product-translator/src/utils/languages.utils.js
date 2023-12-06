import { LANGUAGES } from "../constants/languages.constants.js";

const getPrimaryLang = (productName, languages) => {
  let primaryLang = undefined;
  languages.forEach((language) => {
    console.log(`${language} : ${productName[language]}`);
    if (productName[language] && !primaryLang) primaryLang = language;
  });
  return primaryLang;
};

const getLanguageName = (language) => {
  if (language.length < 2) {
    //TODO : Throw error due to invalid lanague code
  }
  const languageCode = language.substring(0, 2);
  const languageName = LANGUAGES[languageCode];
  return languageName;
};

export { getPrimaryLang, getLanguageName };
