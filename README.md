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
    "page": 1,
    "limit": 10,
    "total": 2036,
    "data": [
        {
            "name": "Thabo Ndebele",
            "gender": "male",
            "gender_probability": 0.66,
            "age": 18,
            "age_group": "teenager",
            "country_id": "AO",
            "country_name": "Angola",
            "country_probability": 0.68,
            "created_at": "2026-04-21T17:37:58.353Z",
            "id": "019db11e-ca51-77f8-a46e-449f3952d52f"
        },
        {
            "name": "Hauwa Tadesse",
            "gender": "female",
            "gender_probability": 0.92,
            "age": 7,
            "age_group": "child",
            "country_id": "KE",
            "country_name": "Kenya",
            "country_probability": 0.62,
            "created_at": "2026-04-21T17:37:58.353Z",
            "id": "019db11e-ca51-77f8-a46e-449e1440c6c8"
        },
        {
            "name": "Zodwa Girma",
            "gender": "female",
            "gender_probability": 0.91,
            "age": 71,
            "age_group": "senior",
            "country_id": "RW",
            "country_name": "Rwanda",
            "country_probability": 0.12,
            "created_at": "2026-04-21T17:37:58.353Z",
            "id": "019db11e-ca51-77f8-a46e-44a2f03658c7"
        },
        {
            "name": "William Johnson",
            "gender": "male",
            "gender_probability": 0.74,
            "age": 81,
            "age_group": "senior",
            "country_id": "AU",
            "country_name": "Australia",
            "country_probability": 0.62,
            "created_at": "2026-04-21T17:37:58.353Z",
            "id": "019db11e-ca51-77f8-a46e-44a0ce4493f1"
        },
        {
            "name": "Ekow Amoah",
            "gender": "male",
            "gender_probability": 0.87,
            "age": 42,
            "age_group": "adult",
            "country_id": "SN",
            "country_name": "Senegal",
            "country_probability": 0.11,
            "created_at": "2026-04-21T17:37:58.353Z",
            "id": "019db11e-ca51-77f8-a46e-449c788c667b"
        },
        {
            "name": "Akosua Adjei",
            "gender": "female",
            "gender_probability": 0.92,
            "age": 6,
            "age_group": "child",
            "country_id": "NG",
            "country_name": "Nigeria",
            "country_probability": 0.4,
            "created_at": "2026-04-21T17:37:58.353Z",
            "id": "019db11e-ca51-77f8-a46e-44a125cb770f"
        },
        {
            "name": "Akua Traoré",
            "gender": "female",
            "gender_probability": 0.82,
            "age": 68,
            "age_group": "senior",
            "country_id": "NG",
            "country_name": "Nigeria",
            "country_probability": 0.44,
            "created_at": "2026-04-21T17:37:58.353Z",
            "id": "019db11e-ca51-77f8-a46e-449d44ca3810"
        },
        {
            "name": "Sharon Wright",
            "gender": "female",
            "gender_probability": 0.86,
            "age": 89,
            "age_group": "senior",
            "country_id": "GB",
            "country_name": "United Kingdom",
            "country_probability": 0.38,
            "created_at": "2026-04-21T17:37:58.353Z",
            "id": "019db11e-ca51-77f8-a46e-449bcb63bf14"
        },
        {
            "name": "Bethlehem Bekele",
            "gender": "female",
            "gender_probability": 0.94,
            "age": 71,
            "age_group": "senior",
            "country_id": "MU",
            "country_name": "Mauritius",
            "country_probability": 0.4,
            "created_at": "2026-04-21T17:37:58.352Z",
            "id": "019db11e-ca50-79da-bcd0-9c0ebc018415"
        },
        {
            "name": "George Martin",
            "gender": "male",
            "gender_probability": 0.79,
            "age": 16,
            "age_group": "teenager",
            "country_id": "BR",
            "country_name": "Brazil",
            "country_probability": 0.35,
            "created_at": "2026-04-21T17:37:58.352Z",
            "id": "019db11e-ca50-79da-bcd0-9c0fca7ebabe"
        }
    ]
}
```

#### Advanced Filtering

##### Supported filters
gender,
age_group,
country_id,
min_age,
max_age,
min_gender_probability,
min_country_probability,

`Example: /api/profiles?gender=male&country_id=NG&min_age=25`

Filters must be combinable. Results must strictly match all conditions.

##### Success Response (200)
```
{
    "status": "success",
    "page": 1,
    "limit": 10,
    "total": 46,
    "data": [
        {
            "name": "Richard Camara",
            "gender": "male",
            "gender_probability": 0.87,
            "age": 31,
            "age_group": "adult",
            "country_id": "NG",
            "country_name": "Nigeria",
            "country_probability": 0.7,
            "created_at": "2026-04-21T17:37:58.350Z",
            "id": "019db11e-ca4e-7ee1-8c01-0e68679de316"
        },
        {
            "name": "Emmanuel Touré",
            "gender": "male",
            "gender_probability": 0.71,
            "age": 38,
            "age_group": "adult",
            "country_id": "NG",
            "country_name": "Nigeria",
            "country_probability": 0.51,
            "created_at": "2026-04-21T17:37:58.249Z",
            "id": "019db11e-c9e9-7a5a-89f9-2731492cd417"
        },
        {
            "name": "Daniel Chukwu",
            "gender": "male",
            "gender_probability": 0.71,
            "age": 60,
            "age_group": "senior",
            "country_id": "NG",
            "country_name": "Nigeria",
            "country_probability": 0.23,
            "created_at": "2026-04-21T17:37:58.246Z",
            "id": "019db11e-c9e6-71d1-9873-b82aca7b3347"
        },
        {
            "name": "David Compaoré",
            "gender": "male",
            "gender_probability": 0.77,
            "age": 65,
            "age_group": "senior",
            "country_id": "NG",
            "country_name": "Nigeria",
            "country_probability": 0.15,
            "created_at": "2026-04-21T17:37:58.245Z",
            "id": "019db11e-c9e5-72dd-a2e2-7383ded779ba"
        },
        {
            "name": "Dele Dao",
            "gender": "male",
            "gender_probability": 0.83,
            "age": 70,
            "age_group": "senior",
            "country_id": "NG",
            "country_name": "Nigeria",
            "country_probability": 0.4,
            "created_at": "2026-04-21T17:37:58.138Z",
            "id": "019db11e-c97a-7b9a-b5a3-efbf1de3dde0"
        },
        {
            "name": "Daniel Kaboré",
            "gender": "male",
            "gender_probability": 0.76,
            "age": 36,
            "age_group": "adult",
            "country_id": "NG",
            "country_name": "Nigeria",
            "country_probability": 0.1,
            "created_at": "2026-04-21T17:37:58.138Z",
            "id": "019db11e-c97a-7b9a-b5a3-efbcb8d9889a"
        },
        {
            "name": "Femi Nikiéma",
            "gender": "male",
            "gender_probability": 0.79,
            "age": 30,
            "age_group": "adult",
            "country_id": "NG",
            "country_name": "Nigeria",
            "country_probability": 0.43,
            "created_at": "2026-04-21T17:37:58.137Z",
            "id": "019db11e-c979-73e8-b089-10efcf021f01"
        },
        {
            "name": "Ama Gbagbo",
            "gender": "male",
            "gender_probability": 0.79,
            "age": 40,
            "age_group": "adult",
            "country_id": "NG",
            "country_name": "Nigeria",
            "country_probability": 0.45,
            "created_at": "2026-04-21T17:37:58.025Z",
            "id": "019db11e-c909-7a94-8431-4860171ca491"
        },
        {
            "name": "Richard Zinsou",
            "gender": "male",
            "gender_probability": 0.8,
            "age": 53,
            "age_group": "adult",
            "country_id": "NG",
            "country_name": "Nigeria",
            "country_probability": 0.52,
            "created_at": "2026-04-21T17:37:58.023Z",
            "id": "019db11e-c907-74a8-9ef5-70c313bde882"
        },
        {
            "name": "Fiifi Okafor",
            "gender": "male",
            "gender_probability": 0.85,
            "age": 28,
            "age_group": "adult",
            "country_id": "NG",
            "country_name": "Nigeria",
            "country_probability": 0.31,
            "created_at": "2026-04-21T17:37:57.918Z",
            "id": "019db11e-c89e-74b4-9dd6-12ada471be9c"
        }
    ]
}
```

#### Sorting
```
sort_by → age | created_at | gender_probability
order  → asc | desc
```

`Example: /api/profiles?country_id=UG&sort_by=age&order=desc`

#### Success Response (200)

```
{
    "status": "success",
    "page": 1,
    "limit": 10,
    "total": 65,
    "data": [
        {
            "name": "Thandiwe Haile",
            "gender": "female",
            "gender_probability": 0.79,
            "age": 88,
            "age_group": "senior",
            "country_id": "UG",
            "country_name": "Uganda",
            "country_probability": 0.57,
            "created_at": "2026-04-21T17:37:57.508Z",
            "id": "019db11e-c704-7b9b-98a5-c5979b6bc366"
        },
        {
            "name": "Tesfaye Abdi",
            "gender": "male",
            "gender_probability": 0.66,
            "age": 87,
            "age_group": "senior",
            "country_id": "UG",
            "country_name": "Uganda",
            "country_probability": 0.46,
            "created_at": "2026-04-21T17:37:57.618Z",
            "id": "019db11e-c772-70ed-81ab-7a5557dba658"
        },
        {
            "name": "Hauwa Mwangi",
            "gender": "female",
            "gender_probability": 0.65,
            "age": 83,
            "age_group": "senior",
            "country_id": "UG",
            "country_name": "Uganda",
            "country_probability": 0.64,
            "created_at": "2026-04-21T17:37:57.616Z",
            "id": "019db11e-c770-7e3b-8bcb-2c2432881fb9"
        },
        {
            "name": "Omar Omar",
            "gender": "male",
            "gender_probability": 0.78,
            "age": 83,
            "age_group": "senior",
            "country_id": "UG",
            "country_name": "Uganda",
            "country_probability": 0.29,
            "created_at": "2026-04-21T17:37:57.506Z",
            "id": "019db11e-c702-7c97-aba5-46a0cff30f9c"
        },
        {
            "name": "Themba Odhiambo",
            "gender": "male",
            "gender_probability": 0.98,
            "age": 72,
            "age_group": "senior",
            "country_id": "UG",
            "country_name": "Uganda",
            "country_probability": 0.57,
            "created_at": "2026-04-21T17:37:57.287Z",
            "id": "019db11e-c627-76ac-92aa-59579fb34513"
        },
        {
            "name": "Desta Achieng",
            "gender": "male",
            "gender_probability": 0.97,
            "age": 72,
            "age_group": "senior",
            "country_id": "UG",
            "country_name": "Uganda",
            "country_probability": 0.8,
            "created_at": "2026-04-21T17:37:57.403Z",
            "id": "019db11e-c69b-7ba8-8eff-74544d764cc9"
        },
        {
            "name": "Mengistu Ali",
            "gender": "male",
            "gender_probability": 0.79,
            "age": 72,
            "age_group": "senior",
            "country_id": "UG",
            "country_name": "Uganda",
            "country_probability": 0.29,
            "created_at": "2026-04-21T17:37:56.821Z",
            "id": "019db11e-c455-7651-a253-a436c819caa4"
        },
        {
            "name": "Ibrahim Desta",
            "gender": "male",
            "gender_probability": 0.82,
            "age": 67,
            "age_group": "senior",
            "country_id": "UG",
            "country_name": "Uganda",
            "country_probability": 0.66,
            "created_at": "2026-04-21T17:37:58.139Z",
            "id": "019db11e-c97b-769c-a0e8-38c03cbe65b1"
        },
        {
            "name": "Maryam Ouma",
            "gender": "female",
            "gender_probability": 0.84,
            "age": 65,
            "age_group": "senior",
            "country_id": "UG",
            "country_name": "Uganda",
            "country_probability": 0.73,
            "created_at": "2026-04-21T17:37:58.025Z",
            "id": "019db11e-c909-7a94-8431-485f48841da4"
        },
        {
            "name": "Bongani Adhiambo",
            "gender": "male",
            "gender_probability": 0.85,
            "age": 62,
            "age_group": "senior",
            "country_id": "UG",
            "country_name": "Uganda",
            "country_probability": 0.91,
            "created_at": "2026-04-21T17:37:56.601Z",
            "id": "019db11e-c379-77fe-beca-ee0d5f3f1d4d"
        }
    ]
}
```

### GET /api/profiles/search

Interpret plain English queries and convert them into filters with pagination (page, limit) applied too

`Example: /api/profiles/search?q=young males from niger`

#### Success Response (200)

```
{
    "status": "success",
    "page": 1,
    "limit": 10,
    "total": 3,
    "data": [
        {
            "name": "Oumar Diallo",
            "gender": "male",
            "gender_probability": 0.75,
            "age": 24,
            "age_group": "adult",
            "country_id": "NE",
            "country_name": "Niger",
            "country_probability": 0.37,
            "created_at": "2026-04-21T17:37:57.505Z",
            "id": "019db11e-c701-774a-92e8-0153d0e569fa"
        },
        {
            "name": "Kobina Konaté",
            "gender": "male",
            "gender_probability": 0.66,
            "age": 18,
            "age_group": "teenager",
            "country_id": "NE",
            "country_name": "Niger",
            "country_probability": 0.84,
            "created_at": "2026-04-21T17:37:56.931Z",
            "id": "019db11e-c4c3-746c-83d6-9283dcf02199"
        },
        {
            "name": "Hervé Segla",
            "gender": "male",
            "gender_probability": 0.95,
            "age": 19,
            "age_group": "teenager",
            "country_id": "NE",
            "country_name": "Niger",
            "country_probability": 0.33,
            "created_at": "2026-04-21T17:37:56.343Z",
            "id": "019db11e-c277-737d-b7f9-72d9086296f4"
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
        "name": "Oumar Diallo",
        "gender": "male",
        "gender_probability": 0.75,
        "age": 24,
        "age_group": "adult",
        "country_id": "NE",
        "country_name": "Niger",
        "country_probability": 0.37,
        "created_at": "2026-04-21T17:37:57.505Z",
        "id": "019db11e-c701-774a-92e8-0153d0e569fa"
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

## Data Seeding

### Seeding the database

`npm run seed`

if you run this command `npm run seed` twice the system will check if the data is already stored in the DB and if so it will skip to avoid data duplication

### Seed file location

`data/profiles.json`

## Technologies Used

JavaScript, NodeJS, Express, MongoDB, Mongoose, UUIDv7, Axios

## Live Deployment

https://persona-ruddy.vercel.app/

## Author

@thaArcadeGuy
