import OpenAI from "openai";
import { logger } from "../utils/logger.utils.js";

async function dummyTranslation(message, sourceLang, targetLang) {
  if (targetLang === "German")
    return "blaue Möbel|Es handelt sich um blaue Möbel, hergestellt von Hin|Es handelt sich um blaue Möbel, die von Hin geschaffen wurden||blaue Möbel";
  else if (targetLang === "English")
    return "blue furniture|It is a blue furniture made by Hin|It is a blue furniture created by Hin||blue furniture";
}

async function dummyVariantTranslation(message, sourceLang, targetLang) {
  if (targetLang === "German") return "|blaue|||||";
  else if (targetLang === "English") return "|blue|||||";
}
function translateDummySetTypeAttribute(message, sourceLang, targetLang) {
  if (targetLang === "German") return "rotes Auto|blaues Auto";
  else if (targetLang === "English") return "red car|blue car";
}

async function translate(message, sourceLang, targetLang) {
  if (sourceLang === targetLang) return message;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `Translate the following ${sourceLang} text to ${targetLang} : ${message}`,
      },
    ],
    temperature: 0,
    max_tokens: 256,
  });

  const translatedMessage = completion.choices[0]?.message?.content;
  logger.info(translatedMessage);
  return translatedMessage;
}

export {
  translate,
  dummyTranslation,
  dummyVariantTranslation,
  translateDummySetTypeAttribute,
};
