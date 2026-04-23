# API Endpoints

This document describes the currently available API endpoints.

---

## Posts

### `POST /posts`

Creates a new blog post.

**Authentication:** No

#### Request Body

```json
{
    "title": "Mi primer post",
    "description": "Descripción del post",
    "content": "Contenido del post",
    "reading_time": 5,
    "tag_id": 3
}
```

#### Success Response

**Status:** `201 Created`

```json
{
    "message": "Post created successfully",
    "data": {
        "post_id": 15,
        "title": "Mi primer post",
        "description": "Descripción del post",
        "content": "Contenido del post",
        "reading_time": 5,
        "status": "DRAFT",
        "scheduled_at": null,
        "published_at": null,
        "created_at": "2026-04-23T06:55:08.376Z",
        "updated_at": "2026-04-23T06:55:08.377Z",
        "tag": {
            "tag_id": 3,
            "description": "Android"
        }
    }
}
```

#### Possible Responses

- `201` → post created successfully
- `400` → `VALIDATION_ERROR`
- `404` → `NOT_FOUND`
- `500` → `INTERNAL_SERVER_ERROR`

#### Notes

- A newly created post is returned with status `DRAFT`
- `scheduled_at` and `published_at` may be `null` on creation
- The response includes the related tag information

---

### `GET /posts`

Returns a paginated list of posts.

**Authentication:** No

#### Query Parameters

- `page` → page number to retrieve
    - optional
    - default value: `1`

- `tag_id` → filters posts by tag id
    - optional

- `search` → filters posts by title
    - optional

#### Pagination Rules

- Pagination is fixed at **20 posts per page**
- Results are ordered by `published_at` in descending order

#### Example Requests

```http
GET /posts?page=1
```

```http
GET /posts?page=1&tag_id=4
```

```http
GET /posts?page=1&search=android
```

```http
GET /posts?page=1&tag_id=4&search=ios
```

#### Success Response

**Status:** `200 OK`

```json
{
    "message": "Posts successfully retrieved",
    "data": {
        "data": [
            {
                "post_id": 12,
                "title": "Mi post numero 8",
                "description": "Descripción del post",
                "content": "Contenido del post",
                "reading_time": 5,
                "status": "PUBLISHED",
                "scheduled_at": null,
                "published_at": "2026-04-23T09:30:00.000Z",
                "created_at": "2026-04-21T10:18:12.830Z",
                "updated_at": "2026-04-21T10:18:12.831Z",
                "tag": {
                    "tag_id": 4,
                    "description": "iOS"
                }
            }
        ],
        "meta": {
            "total": 1,
            "page": 1,
            "total_pages": 1,
            "has_next_page": false,
            "has_prev_page": false
        }
    }
}
```

#### Possible Responses

- `200` → posts returned successfully
- `400` → `VALIDATION_ERROR`
- `404` → `NOT_FOUND`
- `500` → `INTERNAL_SERVER_ERROR`

#### Notes

- If no `page` query parameter is provided, page `1` is used by default
- The endpoint returns up to **20 posts per page**
- `tag_id` can be used to filter posts by tag
- `search` can be used to filter posts by title
- Results are sorted by publication date in descending order
- The response includes related tag information for each post
- Pagination metadata is returned inside `data.meta`

---

### `GET /posts/:id`

Returns a blog post if it exists.

**Authentication:** No

#### Route Parameters

- `id` → post identifier

#### Success Response

**Status:** `200 OK`

```json
{
    "message": "Post fetched successfully",
    "data": {
        "post_id": 15,
        "title": "Mi primer post",
        "description": "Descripción del post",
        "content": "Contenido del post",
        "reading_time": 5,
        "status": "DRAFT",
        "scheduled_at": null,
        "published_at": null,
        "created_at": "2026-04-23T06:55:08.376Z",
        "updated_at": "2026-04-23T06:55:08.377Z",
        "tag": {
            "tag_id": 3,
            "description": "Android"
        }
    }
}
```

#### Possible Responses

- `200` → post returned successfully
- `400` → `VALIDATION_ERROR`
- `404` → `NOT_FOUND`
- `500` → `INTERNAL_SERVER_ERROR`

#### Notes

- Returns the post together with its related tag information
- If the provided `id` is invalid, the endpoint should return `VALIDATION_ERROR`
- If the post does not exist, the endpoint should return `NOT_FOUND`
