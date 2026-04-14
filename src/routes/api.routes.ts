import { Router } from "express";
import { HTTP_STATUSES } from "../utils/constants.utils";

const apiRouter = Router();

apiRouter.get("/", (req, res) => {
    res.status(HTTP_STATUSES.SUCCESS).send(
        "Welcome to Ismael Cordon Portfolio API",
    );
});

export default apiRouter;
