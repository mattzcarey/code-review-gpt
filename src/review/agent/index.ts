import { type GenerateTextResult, type LanguageModelV1, generateText } from 'ai';
import {
  createSubmitSummaryTool,
  createSuggestChangesTool,
  readFileTool,
} from '../../common/llm/tools';
import type { PlatformProvider } from '../../common/platform/provider';
import { logger } from '../../common/utils/logger';

export const reviewAgent = async (
  prompt: string,
  model: LanguageModelV1,
  platformProvider: PlatformProvider,
  onSummarySubmit?: () => void
  // biome-ignore lint/suspicious/noExplicitAny: fine
): Promise<GenerateTextResult<Record<string, any>, string>> => {
  const submitSummaryTool = createSubmitSummaryTool(platformProvider);
  const suggestChangesTool = createSuggestChangesTool(platformProvider);

  const result = await generateText({
    model,
    prompt,
    tools: {
      read_file: readFileTool,
      suggest_change: suggestChangesTool,
      submit_summary: submitSummaryTool,
    },
    maxSteps: 25,
    onStepFinish: (step) => {
      const called = step.toolCalls?.some((tc) => tc.toolName === 'submit_summary');
      const executed = step.toolResults?.some((tr) => tr.toolName === 'submit_summary');
      if ((called || executed) && onSummarySubmit) {
        logger.debug('Detected submit_summary tool usage in step, triggering callback.');
        onSummarySubmit();
      }
    },
  });

  return result;
};

export const runAgenticReview = async (
  initialPrompt: string,
  model: LanguageModelV1,
  platformProvider: PlatformProvider,
  maxRetries = 3
): Promise<{ success: boolean; message: string }> => {
  logger.info(`Running agentic review (max retries: ${maxRetries})...`);

  // biome-ignore lint/suspicious/noExplicitAny: fine for GenerateTextResult generics
  let latestResult: GenerateTextResult<Record<string, any>, string> | null = null;
  let currentPrompt = initialPrompt;
  let accumulatedContext = '';
  let summaryToolCalled = false;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    logger.info(`Attempt ${attempt}/${maxRetries}...`);
    summaryToolCalled = false;

    latestResult = await reviewAgent(currentPrompt, model, platformProvider, () => {
      summaryToolCalled = true;
    });

    if (summaryToolCalled) {
      logger.info(`Agent submitted summary on attempt ${attempt} (detected via callback).`);
      break;
    }

    logger.warn(`Agent did not submit summary on attempt ${attempt}.`);

    if (attempt < maxRetries) {
      const attemptContext = latestResult.toolResults
        .map((res) => `Tool Result (${res.toolName}): ${JSON.stringify(res.result)}`)
        .join('\n');
      const finalTextContext = latestResult.text ? `\nFinal Text: ${latestResult.text}` : '';
      accumulatedContext += `\n\n--- Attempt ${attempt} Context ---\n${attemptContext}${finalTextContext}\n--- End Attempt ${attempt} Context ---`;
      currentPrompt = `${initialPrompt}${accumulatedContext}\n\nPlease continue the task based on previous attempts and ensure you call submit_summary.`;
      logger.info(`Preparing for attempt ${attempt + 1}.`);
    }
  }

  if (!latestResult) {
    throw new Error('Agent did not produce any result.');
  }

  const finalSummarySubmitted = summaryToolCalled;

  if (!finalSummarySubmitted) {
    logger.error(
      `Agent failed to submit summary after ${maxRetries} attempts. Proceeding to parse final text anyway.`
    );
  }

  try {
    const finalObject = JSON.parse(latestResult.text);
    if (typeof finalObject.success === 'boolean' && typeof finalObject.message === 'string') {
      logger.info(
        `Agent returned valid JSON. Success flag: ${finalObject.success}. Summary submitted (detected via callback): ${finalSummarySubmitted}`
      );
      return finalObject;
    }
    logger.error('Parsed final text but structure is invalid.');
    return {
      success: finalSummarySubmitted,
      message: `Agent returned unexpected final text structure: ${latestResult.text}`,
    };
  } catch (error) {
    logger.error('Failed to parse final agent text:', error);
    return {
      success: finalSummarySubmitted,
      message: `Agent finished with non-JSON text: ${latestResult.text}`,
    };
  }
};
