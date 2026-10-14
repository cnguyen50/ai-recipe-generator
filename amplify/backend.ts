
import { defineBackend } from "@aws-amplify/backend";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { data } from "./data/resource";

const backend = defineBackend({
  auth,
  data,
});

const bedrockDataSource =
  backend.data.resources.graphqlApi.addHttpDataSource(
    "bedrockDS",
    "https://bedrock-runtime.us-west-2.amazonaws.com",
    {
      authorizationConfig: {
        signingRegion: "us-west-2",
        signingServiceName: "bedrock",
      },
    }
  );

bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:us-west-2:${backend.stack.account}:inference-profile/us.amazon.nova-micro-v1:0`,
      "arn:aws:bedrock:us-west-2::foundation-model/amazon.nova-micro-v1:0",
      "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-micro-v1:0",
      "arn:aws:bedrock:us-east-2::foundation-model/amazon.nova-micro-v1:0",
    ],
  })
);
