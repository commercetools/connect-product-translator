import CustomError from "../errors/custom.error.js";
import { HTTP_STATUS_SUCCESS_ACCEPTED } from "../constants/http-status.constants.js";
import { MESSAGE_TYPE } from "../constants/message-type.constants.js";
import { decodeToJson } from "../utils/decoder.utils.js";
import { STATES } from "../constants/states.constants.js";
import { getStateByKey } from "../client/states.client.js";
import { logger } from "../utils/logger.utils.js";

function validateRequest(request) {
  // Check request body
  if (!request.body) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      "Missing request body. No Pub/Sub message was received.",
    );
  }

  // Check if the body comes in a message
  if (!request.body.message || !request.body.message.data) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      "Missing body message. Wrong Pub/Sub message format.",
    );
  }

  const encodedMessageBody = request.body.message.data;
  const messageBody = decodeToJson(encodedMessageBody);
  logger.info(`Incoming message body : ${JSON.stringify(messageBody)}`)

  // Make sure incoming message contains correct notification type
  if (!MESSAGE_TYPE.includes(messageBody.type)) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `Message type ${messageBody.type} is incorrect.`,
    );
  }

  // Make sure incoming message contains the identifier of the changed product
  const resourceTypeId = messageBody?.resource?.typeId;
  const resourceId = messageBody?.resource?.id;

  if (resourceTypeId !== "product" && !resourceId) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `No product ID is found in message.`,
    );
  }
}

async function isRequestTranslationStateMessage(messageBody) {
  const stateId = messageBody?.state.id;
  const state = await getStateByKey(STATES.REQUEST_TRANSLATION);
  if (state.id !== stateId) {
    return false;
  }
  return true;
}
export { validateRequest, isRequestTranslationStateMessage };
