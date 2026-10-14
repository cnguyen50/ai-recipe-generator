
import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const { ingredients = [] } = ctx.args;

  const prompt = `Suggest a recipe using these ingredients: ${ingredients.join(", ")}. Include a recipe name, ingredients, and step-by-step cooking instructions.`;

  return {
    resourcePath: "/model/us.amazon.nova-micro-v1:0/invoke",
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [{ text: prompt }],
          },
        ],
        inferenceConfig: {
          maxTokens: 1000,
          temperature: 0.7,
        },
      }),
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  if (!ctx.result) {
    util.error("Bedrock returned no HTTP response.", "BedrockError");
  }

  const { statusCode, body } = ctx.result;

  if (statusCode < 200 || statusCode >= 300) {
    util.error(
      `Bedrock request failed: ${body}`,
      "BedrockError"
    );
  }

  if (!body) {
    util.error("Bedrock returned an empty response.", "BedrockError");
  }

  const parsedBody = JSON.parse(body);

  return {
    body: parsedBody.output.message.content
      .filter((item) => item.text)
      .map((item) => item.text)
      .join("\n"),
  };
}
