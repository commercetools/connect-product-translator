import { Router } from "express";

import { translationHandler } from "../controllers/translation.controller.js";

const translationRouter = Router();

translationRouter.post("/product-translator", translationHandler);

export default translationRouter;
