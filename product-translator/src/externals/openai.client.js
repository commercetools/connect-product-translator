import OpenAI from "openai";
import { logger } from "../utils/logger.utils.js";

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

export { translate };
