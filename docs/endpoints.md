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

### `PATCH /posts/:id/hide`

Sets a post status to `HIDDEN`, making it not visible on the website.

**Authentication:** No

#### Route Parameters

- `id` → post identifier

#### Success Response

**Status:** `200 OK`

```json
{
    "message": "Post hidden successfully",
    "data": null
}
```

#### Possible Responses

- `200` → post hidden successfully
- `400` → `VALIDATION_ERROR`
- `404` → `NOT_FOUND`
- `500` → `INTERNAL_SERVER_ERROR`

---

### `DELETE /posts/:id/delete`

Deletes a post permanently from the database.

**Authentication:** No

#### Route Parameters

- `id` → post identifier

#### Success Response

**Status:** `204 No Content`

(No response body)

#### Possible Responses

- `204` → post deleted successfully
- `400` → `VALIDATION_ERROR`
- `404` → `NOT_FOUND`
- `500` → `INTERNAL_SERVER_ERROR`

#### Notes

- This operation is irreversible
- The post is permanently removed from the database

---

### `PATCH /posts/:id/publish`

Sets a post status to `PUBLISHED` and updates the `published_at` field.

**Authentication:** No

#### Route Parameters

- `id` → post identifier

#### Success Response

**Status:** `200 OK`

```json
{
    "message": "Post published successfully",
    "data": null
}
```

#### Possible Responses

- `200` → post published successfully
- `400` → `VALIDATION_ERROR`
- `404` → `NOT_FOUND`
- `409` → `CONFLICT`
- `500` → `INTERNAL_SERVER_ERROR`

#### Notes

- Posts can be published from the following states:
    - `DRAFT`
    - `SCHEDULED`
    - `HIDDEN`

---

### `PATCH /posts/:id/schedule`

Schedules a post by setting its status to `SCHEDULED`.

**Authentication:** No

#### Route Parameters

- `id` → post identifier

#### Request Body

```json
{
    "scheduled_at": "2026-04-25T10:00:00.000Z"
}
```

#### Success Response

**Status:** `200 OK`

```json
{
    "message": "Post scheduled successfully",
    "data": null
}
```

#### Possible Responses

- `200` → post scheduled successfully
- `400` → `VALIDATION_ERROR`
- `404` → `NOT_FOUND`
- `409` → `CONFLICT`
- `500` → `INTERNAL_SERVER_ERROR`

#### Notes

- `scheduled_at` must be a valid ISO 8601 datetime with timezone
- Posts can be scheduled from:
    - `DRAFT`
    - `SCHEDULED`

---

### `GET /posts/scheduled/due`

Returns the IDs of posts that are scheduled and ready to be published.

A post is considered "due" if:

- its status is `SCHEDULED`
- `scheduled_at` is less than or equal to the current date

**Authentication:** No

#### Success Response

**Status:** `200 OK`

```json
{
    "message": "Scheduled posts retrieved successfully",
    "data": [
        {
            "post_id": 12
        },
        {
            "post_id": 15
        }
    ]
}
```

#### Possible Responses

- `200` → scheduled posts retrieved successfully
- `500` → `INTERNAL_SERVER_ERROR`

#### Notes

- This endpoint is primarily intended for internal or automated usage

## CV

### `POST /cv`

Generates and returns the CV document as a PDF file.

The PDF response is intended to be opened directly in a new browser tab or downloaded by the client.

**Authentication:** No

#### Headers

| Header            | Required | Description                                                                                                     |
| ----------------- | -------: | --------------------------------------------------------------------------------------------------------------- |
| `Accept-Language` |       No | Language used to generate the CV. Accepted values: `es`, `en`. Defaults to English when missing or unsupported. |

#### Accepted Languages

- `es` → Spanish CV
- `en` → English CV
- missing or unsupported value → English CV

#### Example Request

```http
POST /cv
Accept-Language: es
```

#### Success Response

**Status:** `200 OK`

**Content-Type:** `application/pdf`

The endpoint returns a PDF binary response.

#### Possible Responses

- `200` → CV PDF generated successfully
- `500` → `INTERNAL_SERVER_ERROR`

#### Notes

- This endpoint does not return the standard JSON response format.
- The response body is the generated PDF file.
- The frontend can open the response in a new browser tab using a blob URL.
- If `Accept-Language` is not provided or does not match `es` or `en`, the English version is returned by default.
