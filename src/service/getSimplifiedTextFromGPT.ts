import OpenAI from "openai";
import { apiKey_ChatGpt } from "../assets/API_KEY";

const openai = new OpenAI({
  apiKey: apiKey_ChatGpt,
});

const completion = openai.chat.completions.create({
  model: "gpt-4o-mini",
  store: true,
  messages: [
    {"role": "user", "content": "write a haiku about ai"},
  ],
});

completion.then((result) => console.log(result.choices[0].message));