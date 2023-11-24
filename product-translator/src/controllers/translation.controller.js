import { logger } from "../utils/logger.utils.js";
import {
  HTTP_STATUS_SERVER_ERROR,
  HTTP_STATUS_SUCCESS_NO_CONTENT,
} from "../constants/http-status.constants.js";
import { validateRequest } from "../validators/message.validators.js";
import { decodeToJson } from "../utils/decoder.utils.js";

export const translationHandler = async (request, response) => {
  try {
    logger.info("Received product state changed message.");
    validateRequest(request);

    // Receive the Pub/Sub message
    const encodedPubSubMessage = request.body.message.data;
    const pubSubMessage = decodeToJson(encodedPubSubMessage);
    logger.info(JSON.stringify(pubSubMessage));

    // TODO : Invoke OpenAI to do translation
  } catch (err) {
    logger.error(err);
    if (err.statusCode) return response.status(err.statusCode).send(err);
    return response.status(HTTP_STATUS_SERVER_ERROR).send(err);
  }

  // Return the response for the client
  return response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
};
