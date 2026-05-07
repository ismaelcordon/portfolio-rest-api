import { Router } from "express";
import { API_ROUTES, HTTP_STATUSES } from "#utils/constants.utils.js";
import postRoutes from "#routes/posts.routes.js";
import cvRoutes from "#routes/cv.routes.js";

const apiRouter = Router();

apiRouter.get("/", (req, res) => {
    res.status(HTTP_STATUSES.SUCCESS).send(
        "Welcome to Ismael Cordon Portfolio API",
    );
});

apiRouter.use(API_ROUTES.POSTS.BASE, postRoutes);

apiRouter.use(API_ROUTES.CV.BASE, cvRoutes);

export default apiRouter;
