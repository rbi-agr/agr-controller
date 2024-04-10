import { LLM, type BaseLLMParams } from "@langchain/core/language_models/llms";
import type { CallbackManagerForLLMRun } from "langchain/callbacks";
import { GenerationChunk } from "langchain/schema";
import { callMistralAI } from "./utils";

// export interface CustomLLMInput extends BaseLLMParams {
//   n: number;
// }

export class CustomLLM extends LLM {

  // constructor(fields: CustomLLMInput) {
  //   super(fields);
  // }

  _llmType() {
    return "custom";
  }

  async _call(
    prompt: string,
    options: this["ParsedCallOptions"],
    runManager: CallbackManagerForLLMRun
  ): Promise<string> {
    // Pass `runManager?.getChild()` when invoking internal runnables to enable tracing
    // await subRunnable.invoke(params, runManager?.getChild());
    const response = await callMistralAI(prompt);
    const content = response.message.content;

    return content
  }

  async *_streamResponseChunks(
    prompt: string,
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): AsyncGenerator<GenerationChunk> {
    // Pass `runManager?.getChild()` when invoking internal runnables to enable tracing
    // await subRunnable.invoke(params, runManager?.getChild());
    // for (const letter of prompt.slice(0, this.n)) {
      yield new GenerationChunk({
        text: prompt,
      });
      // Trigger the appropriate callback
      await runManager?.handleLLMNewToken(prompt);
    // }
  }
}