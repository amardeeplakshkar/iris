import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, generateText, Output } from 'ai';
import React from 'react'
import { z } from 'zod';

const openai = createOpenAI({
    name: 'azure',
    apiKey: process.env.OPENAI_API_KEY!,
    baseURL: process.env.OPENAI_BASE_URL!,
})

const responseSchema = z.object({
    summary: z.string(),
    sources: z.array(
      z.object({
        title: z.string(),
        url: z.string().url(),
      })
    ),
  });

const page = async () => {
  async function getIPL2025Winner() {
        const url = `https://text.pollinations.ai/who won ipl 2025?model=searchgpt&json=true&system=You are an intelligent web search assistant. Your job is to take user queries and return a clear, concise, and helpful answer using recent web data. Format your response in the following JSON format:{
          "summary": "A short 2-3 sentence summary of the answer.",
          "sources": [
            {
              "title": "Page title",
              "url": "https://source-link.com"
            }
          ]
        }`;
      
        try {
          const res = await fetch(url);
          const data = await res.json();
      
          // Optional: Validate with zod
          const parsed = responseSchema.parse(data);
      
          return parsed;
        } catch (error) {
          console.error('Failed to fetch or parse:', error);
          return null;
        }
      }
      const object = await getIPL2025Winner()
    return (
        <pre className='overflow-y-auto h-dvh p-2  whitespace-pre-wrap'>
            {JSON.stringify(object, null, 2)}
        </pre>
    )
}

export default page