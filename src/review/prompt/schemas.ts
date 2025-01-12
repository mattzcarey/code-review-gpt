import { z } from 'zod';

export const reviewSchema = z.array(
  z.object({
    targetCodeBlock: z
      .string()
      .describe(
        'The exact code block that the feedback is about verbatim. Do not include any other text or comments in the code block. Do not include ``` or any other formatting.'
      ),
    suggestedChanges: z
      .string()
      .describe(
        'The full code block including any suggested changes if it makes sense to have them. Do not include any other text or comments in the code block. Do not include ``` or any other formatting. Do not include any + or - to indicate the changes.'
      )
      .optional(),
    reasoning: z
      .string()
      .describe(
        'The review of the code block and the reasoning for the suggested changes (if any). Justify the changes you are making to the code block as a code reviewer would. If there are no suggested changes, just write a review of the code block.'
      ),
  })
);

export const feedbackSchema = z.object({
  fileName: z.string().describe('The name of the file that the code changes are in'),
  riskScore: z
    .number()
    .describe(
      'A risk score from 1 to 5, where 1 is the lowest risk to the code base if the code is merged and 5 is the highest risk which would likely break something or be unsafe'
    ),
  review: reviewSchema,
  confidence: z
    .number()
    .describe(
      'A confidence score from 1 to 5 about how confident you are in the risk score, where 1 is the lowest confidence and 5 is the highest confidence. Low confidence scores are for when you are not confident about the library being used or the code being safe. High confidence scores are for objective bad practise.'
    ),
});
