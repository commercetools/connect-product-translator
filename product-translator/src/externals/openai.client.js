import OpenAI from "openai";

async function getAIChat() {
  console.log(process.env.OPENAI_API_KEY);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const message = "Hello my name is Hin.";
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `Translate the following English text to German: ${message}`,
      },
    ],
    temperature: 0,
    max_tokens: 256,
  });

  const translatedMessage = completion.choices[0]?.message?.content;
  console.log(translatedMessage);

  // const chatCompletion = await openai.chat.completions.create({
  //     messages: [{ role: "user", content: "Say this is a test" }],
  //     model: "gpt-3.5-turbo",
  // });
}
getAIChat();
