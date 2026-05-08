export const HTTP_STATUSES = {
    SUCCESS: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_CONTENT: 422,
    INTERNAL_SERVER_ERROR: 500,
};

export const API_ROUTES = {
    BASE: "/dev/api",
    POSTS: {
        BASE: "/posts",
        BY_ID: "/:id",
        PARAMS: {
            ID: "id",
        },
        HIDE_BY_ID: "/:id/hide",
        PUBLISH_BY_ID: "/:id/publish",
        SCHEDULE_BY_ID: "/:id/schedule",
        SCHEDULED_DUE: "/scheduled/due",
        UPDATE_BY_ID: "/:id/update",
    },
    TAGS: {
        BASE: "/tags",
    },
    CV: {
        BASE: "/cv",
    },
};

export const POSTS_PER_PAGE = 20;
