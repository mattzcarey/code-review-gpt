import Instructor from "@instructor-ai/instructor"
import OpenAI from "openai"
import { z } from "zod"

interface IAIModel {
  modelName: string
  provider: string
  temperature: number
  apiKey: string
  retryCount?: number
  organization: string | undefined
}

const FeedbackSchema = z.object({
  fileName: z.string().describe("The name of the file"),
  riskScore: z
    .number()
    .describe(
      "The risk score of the file. A number between 0 and 5, with 5 being the highest risk and 0 being the lowest."
    ),
  details: z.string().describe("The details of the feedback")
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
    switch (options.provider) {
      case "openai":
        this.oai = new OpenAI({
          apiKey: options.apiKey,
          organization: options.organization
        })

        this.instruct = Instructor({
          client: this.oai,
          mode: "TOOLS"
        })

        break
      case "bedrock":
        throw new Error("Bedrock provider not implemented")
      default:
        throw new Error("Provider not supported")
    }

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
