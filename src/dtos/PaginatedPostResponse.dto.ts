import { PostDto } from "./Post.dto";

export type PaginatedPostResponseDto = {
    data: PostDto[];
    meta: {
        total: number;
        page: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
};
