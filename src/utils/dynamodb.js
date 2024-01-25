import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";

const SYBIL_BLOCKLIST_TABLE_NAME = "holonym-api-sybil-blocklist";

const ddbClient = new DynamoDBClient({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: "us-east-1",
});

export async function blocklistPutAddress(address) {
  try {
    return await ddbClient.send(
      new PutItemCommand({
        TableName: SYBIL_BLOCKLIST_TABLE_NAME,
        Item: {
          address: {
            S: address,
          },
        },
      })
    );
  } catch (err) {
    if (err.name === "ProvisionedThroughputExceededException") {
      console.error(
        "!!!!!!!!!!! DynamoDB error: ProvisionedThroughputExceededException !!!!!!!!!!!"
      );
    }
    throw err;
  }
}

export async function blocklistGetAddress(address) {
  try {
    const result = await ddbClient.send(
      new GetItemCommand({
        TableName: SYBIL_BLOCKLIST_TABLE_NAME,
        Key: {
          address: {
            S: address,
          },
        },
      })
    );
    return result;
  } catch (err) {
    if (err.name === "ProvisionedThroughputExceededException") {
      console.error(
        "!!!!!!!!!!! DynamoDB error: ProvisionedThroughputExceededException !!!!!!!!!!!"
      );
    }
    throw err;
  }
}
