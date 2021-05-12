import { APIGatewayEvent, APIGatewayProxyEventQueryStringParameters, Context } from 'aws-lambda'
import { IWebhookDeliveryResponse, IWebhookDeliveryItem, SignatureHelper } from "@kentico/kontent-webhook-helper";

import * as recombee from "recombee-api-client";

import Post from "./model/post";

import createKontentClient from "./model/kontent-client";

// @ts-ignore - netlify env. variable
const { RECOMBEE_API_KEY, KONTENT_SECRET } = process.env;


/* FUNCTION HANDLER */
export async function handler(event: APIGatewayEvent, context: Context) {

  // Only receiving POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Empty body
  if (!event.body) {
    return { statusCode: 400, body: "Missing Data" };
  }

  const recombeeApiId = event.queryStringParameters?.apiId;

  // Consistency check - make sure your netlify enrionment variable and your webhook secret matches
  /*if (!event.headers['x-kc-signature'] || !SignatureHelper.isValidSignatureFromString(event.body, KONTENT_SECRET, event.headers['x-kc-signature'])) {
    return { statusCode: 401, body: "Unauthorized" };
  }*/

  const webhook: IWebhookDeliveryResponse = JSON.parse(event.body);

  if (webhook.message.type == "content_item_variant") {
    const operation = webhook.message.operation;
    switch (operation) {
      // publish webhook
      case "publish":
        {
          const kontentClient = createKontentClient(webhook.message.project_id);
          const recombeeClient = new recombee.ApiClient(recombeeApiId, RECOMBEE_API_KEY);
          const rqs = recombee.requests;

          for (let item of webhook.data.items) {
            if (item.type != "post") continue;
            const response = await (kontentClient.item<Post>(item.codename).queryConfig({ waitForLoadingNewContent: true }).languageParameter(item.language).toPromise());
            const post = response.item;

            recombeeClient.send(new rqs.SetItemValues(post.system.id, post.toRecombeeItem(), { cascadeCreate: true }), (err: any, response: any) => {
              console.error(err);
              console.log(response);
            });
          }

          return { statusCode: 200 };
        }

      // unpublish webhook
      case "unpublish":
        {
          const recombeeClient = new recombee.ApiClient(recombeeApiId, RECOMBEE_API_KEY);
          const rqs = recombee.requests;
          for (let item of webhook.data.items) {
            if (item.type != "post") continue;

            recombeeClient.send(new rqs.DeleteItem(item.id), (err: any, response: any) => {
              console.error(err);
              console.log(response);
            });
          }

          return { statusCode: 200 };
        }

      default:
        return { statusCode: 200};
    }
  }

}
