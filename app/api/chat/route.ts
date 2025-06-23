import {NextRequest} from "next/server";
import { smoothStream, streamText} from "ai";
import { systemInstructions, tools } from "@/constants";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const openai = createOpenAICompatible({
    apiKey: process.env.OPENAI_API_KEY!,
    baseURL: process.env.OPENAI_BASE_URL!,
    name: "azure-openai",
})

export const maxDuration = 30;

export async function POST(req: NextRequest) {
    const {messages, webSearch, reasoning } = await req.json();

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const system = `${systemInstructions}\n\nToday's date is ${formattedDate}. Please consider this current date for context.`;

    let model;
    switch (true) {
        case webSearch:
            model = openai("searchgpt");
            break;
        case reasoning:
            model = openai("deepseek-reasoning");
            break;
        default:
            model = openai("openai");
    }

    const response = await streamText({
        model,
        system,
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
        },
        messages,
        maxSteps: 10,          
        tools,
        experimental_continueSteps: true,
        experimental_toolCallStreaming: true,
        experimental_transform: smoothStream({
            delayInMs: 20,
            chunking: "word",
        })
    });
    return response.toDataStreamResponse({
        sendReasoning: true,
        sendSources: true,
        sendUsage: true,
      });
}