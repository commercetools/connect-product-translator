import {
  getProductById,
  updateProductState,
} from "../client/products.client.js";
import { STATES } from "../constants/states.constants.js";

const changeProductToTranslationInProgressState = async (product) => {
  const updatedProduct = await updateProductState(
    product,
    STATES.TRANSLATION_IN_PROCESS,
  );
  return updatedProduct;
};

const retrieveProduct = async (pubSubMessage) => {
  const productId = pubSubMessage.resource.id;
  const product = await getProductById(productId);
  return product;
};

export { changeProductToTranslationInProgressState, retrieveProduct };
