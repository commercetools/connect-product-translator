import { createApiRoot } from "./create.client.js";
import CustomError from "../errors/custom.error.js";
import { HTTP_STATUS_SUCCESS_ACCEPTED } from "../constants/http-status.constants.js";

export async function getLanguages() {
  return await createApiRoot()
    .get()
    .execute()
    .then((response) => response.body.languages)
    .catch((error) => {
      throw new CustomError(HTTP_STATUS_SUCCESS_ACCEPTED, error.message, error);
    });
}
