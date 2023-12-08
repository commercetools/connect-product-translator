import OpenAI from "openai";
import { logger } from "../utils/logger.utils.js";

async function dummyTranslation(value) {
  return value;
}

async function translate(sourceLang, targetLang, message) {
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

  // const chatCompletion = await openai.chat.completions.create({
  //     messages: [{ role: "user", content: "Say this is a test" }],
  //     model: "gpt-3.5-turbo",
  // });
}

export { translate, dummyTranslation };
