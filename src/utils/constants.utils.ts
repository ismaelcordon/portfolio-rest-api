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
    },

    CV: {
        BASE: "/cv",
    },
};

export const POSTS_PER_PAGE = 20;
