import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type OptimizationMode = 'coding' | 'general' | 'creative' | 'logical';

const SYSTEM_INSTRUCTIONS: Record<OptimizationMode, string> = {
  coding: `You are an expert Prompt Engineer specializing in Large Language Models for software development. 
Your goal is to transform a raw, vague coding prompt into a highly structured, clear, and effective prompt.
Follow these principles:
1. Define the Role: Start with "Act as a senior software engineer..."
2. Context: Include necessary context (language, framework, environment).
3. Objectives: Clearly state the desired outcome.
4. Constraints: List any specific rules or limitations.
5. Output Format: Specify how the code should be presented.
6. Examples: If applicable, suggest where examples could be added.
Return ONLY the optimized prompt text.`,

  general: `You are a professional Prompt Engineer. 
Your goal is to transform a simple user request into a comprehensive, high-quality prompt for an AI.
Follow these principles:
1. Clarity: Remove ambiguity.
2. Structure: Use headers or bullet points if helpful.
3. Persona: Assign a relevant expert persona.
4. Specificity: Add details that help the AI understand the nuance.
5. Tone: Specify the desired tone of the response.
Return ONLY the optimized prompt text.`,

  creative: `You are a Creative Prompt Specialist. 
Your goal is to transform a basic creative idea into a rich, evocative prompt that inspires high-quality creative output.
Follow these principles:
1. Vivid Imagery: Use descriptive language.
2. Style/Mood: Define the artistic style, mood, or atmosphere.
3. Perspective: Suggest a unique angle or point of view.
4. Constraints: Add interesting creative boundaries.
Return ONLY the optimized prompt text.`,

  logical: `You are a Logical Reasoning Prompt Architect. 
Your goal is to transform a question into a prompt that forces step-by-step, analytical thinking.
Follow these principles:
1. Chain of Thought: Explicitly ask the AI to "think step-by-step".
2. Verification: Ask the AI to double-check its logic.
3. Structured Output: Request a logical breakdown (Premise, Analysis, Conclusion).
Return ONLY the optimized prompt text.`
};

export async function optimizePrompt(rawPrompt: string, mode: OptimizationMode): Promise<string> {
  if (!rawPrompt.trim()) return "";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: rawPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS[mode],
        temperature: 0.7,
      },
    });

    return response.text || "Failed to generate optimized prompt.";
  } catch (error) {
    console.error("Optimization error:", error);
    throw new Error("Failed to optimize prompt. Please check your connection and try again.");
  }
}
