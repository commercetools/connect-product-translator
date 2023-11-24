import { Router } from "express";

import { logger } from "../utils/logger.utils.js";
import { translationHandler } from '../controllers/translation.controller.js';

const translationRouter = Router();

translationRouter.post("/product-translator", translationHandler);

export default translationRouter;
