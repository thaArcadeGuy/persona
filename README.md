## Description

A REST API that aggregates demographic predictions from external services and persists profiles with UUID v7 identifiers.

## Base URL

`https://persona-ruddy.vercel.app`

## Endpoints

### POST /api/profiles

Creates a new profile or returns existing one

**Request Body**

```json
{ "name": "kambere" }
```

#### Success Response (201)

```
{
    "status": "success",
    "data": {
        "name": "kambere",
        "gender": "male",
        "gender_probability": 0.91,
        "sample_size": 11,
        "age": 50,
        "age_group": "adult",
        "country_id": "CD",
        "country_probability": 0.4694886297717637,
        "created_at": "2026-04-17T18:58:43.520Z",
        "id": "019d9ccf-48bf-75b3-90c5-fd771f49352e"
    }
}
```

#### Success Response (200)

```
{
    "status": "success",
    "message": "Profile already exists",
    "data": {
        "name": "kambere",
        "gender": "male",
        "gender_probability": 0.91,
        "sample_size": 11,
        "age": 50,
        "age_group": "adult",
        "country_id": "CD",
        "country_probability": 0.4694886297717637,
        "created_at": "2026-04-17T18:58:43.520Z",
        "id": "019d9ccf-48bf-75b3-90c5-fd771f49352e"
    }
}
```

### GET /api/profiles

Get all profiles

#### Success Response (200)

```
{
    "status": "success",
    "count": 4,
    "data": [
        {
            "name": "speke",
            "gender": "male",
            "age": 42,
            "age_group": "adult",
            "country_id": "GB",
            "id": "019d9cbe-42a0-7458-87ab-407e4ee47263"
        },
        {
            "name": "kambere",
            "gender": "male",
            "age": 50,
            "age_group": "adult",
            "country_id": "CD",
            "id": "019d9ccf-48bf-75b3-90c5-fd771f49352e"
        },
        {
            "name": "muhindo",
            "gender": "male",
            "age": 40,
            "age_group": "adult",
            "country_id": "CD",
            "id": "019d9cd2-b527-7a7c-9cf3-28f0a5278330"
        },
        {
            "name": "bwambale",
            "gender": "male",
            "age": 50,
            "age_group": "adult",
            "country_id": "UG",
            "id": "019d9cd3-1e80-7b2c-b35f-6eb298dde999"
        }
    ]
}
```

### GET /api/profiles/:id

Get profile by ID

#### Success Response (200)

```
{
    "status": "success",
    "data": {
        "name": "muhindo",
        "gender": "male",
        "gender_probability": 0.76,
        "sample_size": 94,
        "age": 40,
        "age_group": "adult",
        "country_id": "CD",
        "country_probability": 0.34271560194701645,
        "created_at": "2026-04-17T19:02:27.879Z",
        "id": "019d9cd2-b527-7a7c-9cf3-28f0a5278330"
    }
}
```

### DELETE /api/profiles/:id

Delete a single profile

#### Success Response (204)

Returns 204 No Content on success.

### Error Responses

```
{
  "status": "error",
  "message": "Bad Request"
}
```

```
{
    "status": "error",
    "message": "Profile not found"
}
```

```
{
    "status": "error",
    "message": "Failed to create profile"
}
```

```
{
    "status": "502",
    "message": "Nationalize returned an invalid response"
}
```

```
{
  "status": "error",
  "message": "Endpoint not found. Please check the API documentation."
}
```

## Local Setup

### Prerequisites

Node `v20.19.0` and above

### Installation

Clone the repo
`git clone https://github.com/thaArcadeGuy/persona.git`
Navigate into the project folder
`cd persona`
Install dependencies
`npm install`

### Running the Server

`npm run start`

## Technologies Used

JavaScript, NodeJS, Express

## Live Deployment

https://persona-ruddy.vercel.app/

## Author

@thaArcadeGuy
