export type PaginatedPostResponseDto<T> = {
    data: T[];
    meta: {
        total: number;
        page: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
};
