import { CreatePostResponseDto } from "./Post.dto";

export type PaginatedPostResponseDto = {
    data: CreatePostResponseDto[];
    meta: {
        total: number;
        page: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
};
