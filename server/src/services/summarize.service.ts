import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatGroq } from "@langchain/groq";
import {
  summarizeRequestSchema,
  summarizeResponseSchema,
  type SummarizeRequest,
} from "../schemas/summarize.schema";
import { env } from "../config/env";

const prompt = ChatPromptTemplate.fromTemplate(
  `Summarize the following note in 2-3 concise sentences capturing the key points.
Do NOT include any preamble, labels, or introductory text - respond with ONLY the summary itself.

Note:
{text}`,
);

const model = new ChatGroq({
  model: env.MODEL_NAME,
  temperature: 0,
  apiKey: env.GROQ_API_KEY,
});

const summarizeChain = prompt.pipe(model).pipe(new StringOutputParser());

export const summarizeContent = async (request: SummarizeRequest) => {
  const { content } = summarizeRequestSchema.parse(request);
  const summary = await summarizeChain.invoke({ text: content });

  return summarizeResponseSchema.parse({ summary: summary.trim() });
};
