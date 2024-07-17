import Instructor from "@instructor-ai/instructor"
import OpenAI from "openai"
import { z } from "zod"

interface IAIModel {
  modelName: string
  temperature: number
  apiKey: string
  retryCount?: number
  organization?: string
}

const FeedbackSchema = z.object({
  filePath: z.string().describe("The complete path of the file"),
  riskScore: z
    .number()
    .describe(
      "The risk score of the file to the code base if merged. A number between 0 and 5, with 5 being the highest risk and 0 being the lowest."
    ),
  details: z
    .string()
    .describe(
      "Write your review of the changes here. Focus on regressions, code smells, following best practise for the language and maximising the performance. Flag any API keys or secrets present in the code in plain text immediately as highest risk. Rate the changes based on SOLID principles if applicable. Do not comment on breaking functions down into smaller, more manageable functions. Also be aware that there will be libraries used which you are not familiar with, so do not comment on those. Use markdown formatting and do not include the filename or risk level here."
    ),
  summary: z.string().describe("A concise 8 word or less summary of the problem")
})

const FeedbackArraySchema = z.array(FeedbackSchema)

const FeedbackResult = z.object({
  feedback: FeedbackArraySchema
})

export type IFeedback = z.infer<typeof FeedbackSchema>

class AIModel {
  private instruct
  private oai: OpenAI
  private modelName: string

  constructor(options: IAIModel) {
    this.oai = new OpenAI({
      apiKey: options.apiKey,
      organization: options.organization
    })

    this.instruct = Instructor({
      client: this.oai,
      mode: "TOOLS"
    })

    this.modelName = options.modelName
  }

  public async getFeedback(prompt: string): Promise<IFeedback[]> {
    const res = await this.instruct.chat.completions.create({
      model: this.modelName,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_model: {
        name: "Feedback",
        schema: FeedbackResult
      }
    })

    return res.feedback
  }

  public async callModel(prompt: string): Promise<string> {
    const res = await this.oai.chat.completions.create({
      model: this.modelName,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })

    if (res.choices.length === 0 || !res.choices[0]) {
      throw new Error("No response from model")
    }

    return res.choices[0].message.content || ""
  }
}

export default AIModel
