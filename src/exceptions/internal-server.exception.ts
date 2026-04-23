import { HTTP_STATUSES } from "#utils/constants.utils.js";
import { CustomException } from "./custom.exception.js";

export class InternalServerException extends CustomException {
    constructor(message = "Internal server error") {
        super(
            message,
            "INTERNAL_SERVER_ERROR",
            HTTP_STATUSES.INTERNAL_SERVER_ERROR,
        );
        this.name = "InternalServerException";
    }
}
