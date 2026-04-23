import { HTTP_STATUSES } from "#utils/constants.utils.js";
import { CustomException } from "./custom.exception";

export class NotFoundException extends CustomException {
    constructor(message = "Not found") {
        super(message, "NOT_FOUND", HTTP_STATUSES.NOT_FOUND);
        this.name = "NotFoundException";
    }
}
