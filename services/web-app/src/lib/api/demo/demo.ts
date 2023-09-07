import { DEMO_URL } from "../../constants";

type DemoReviewLambdaResponse = {
  statusCode: number;
  body: string | undefined;
};

export const postDemoReview = async (
  code: string
): Promise<DemoReviewLambdaResponse> => {
  try {
    const response = await fetch(`${DEMO_URL}/demoReview`, {
      method: "POST",
      body: JSON.stringify({
        code: code,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return (await response.json()) as DemoReviewLambdaResponse;
  } catch (error) {
    console.log(error);

    return {
      statusCode: 500,
      body: undefined,
    };
  }
};
