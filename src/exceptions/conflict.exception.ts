import { HTTP_STATUSES } from "#utils/constants.utils.js";
import { CustomException } from "./custom.exception.js";

export class ConflictException extends CustomException {
    constructor(message = "Conflict exception") {
        super(message, "CONFLICT_ERROR", HTTP_STATUSES.CONFLICT);
        this.name = "ConflictException";
    }
}
