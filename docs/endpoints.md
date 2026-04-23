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
