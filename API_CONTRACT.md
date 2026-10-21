# API Contract (source of truth for apps/api and apps/web)

Base URL: http://localhost:4000. JSON. No auth. CORS allows CORS_ORIGIN.

## Types
Wine: { id: number, externalId: string, name: string, winery: string, type: WineType, grape: string|null, region: string|null, country: string|null, ratingAverage: number|null, ratingReviews: number|null, imageUrl: string|null }
WineType: "red"|"white"|"sparkling"|"rose"|"dessert"|"port"
FoodCategory: { id: number, slug: string, name: string }
Food: { id: number, slug: string, name: string, category: FoodCategory }
Paginated<T>: { items: T[], total: number, page: number, pageSize: number }
WinePairing: { food: Food, strength: number /*1-5*/, reason: string }
FoodPairing: { wine: Wine, strength: number, reason: string }

## Endpoints
GET /health -> { status: "ok" }
GET /wines?type=&country=&q=&page=1&pageSize=12 -> Paginated<Wine> (q = case-insensitive match on name/winery/grape; pageSize max 50; invalid params -> 400)
GET /wines/countries -> string[]
GET /wines/:id -> Wine | 404
GET /wines/:id/pairings -> WinePairing[] sorted by strength desc | 404
GET /food-categories -> FoodCategory[]
GET /foods?category=<slug> -> Food[]
GET /foods/:slug -> Food | 404
GET /foods/:slug/wines -> FoodPairing[] sorted by strength desc, then wine ratingAverage desc | 404
POST /sync -> { fetched: number, upserted: number } (header x-sync-token must equal SYNC_TOKEN env, else 401)

Errors: { statusCode, message, error }.
