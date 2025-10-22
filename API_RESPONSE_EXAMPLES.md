# 📚 LiteAPI Response Examples

## Example API Responses for Reference

### 1. Hotel Details Response

**Request:**
```
GET https://api.liteapi.travel/v3.0/data/hotel?hotelId=lp3803c
```

**Response:**
```json
{
  "data": {
    "id": "lp3803c",
    "name": "Palette Resort Myrtle Beach by OYO",
    "hotelDescription": "<p><strong>Oceanfront Property with Luxurious Amenities</strong></p><p>Palette Resort Myrtle Beach by OYO offers a prime beachfront location with modern amenities. Guests can enjoy direct beach access, outdoor pool, and comfortable accommodations perfect for families and couples.</p>",
    "hotelImportantInformation": "Guests are required to show a photo identification and credit card upon check-in. Please note that all Special Requests are subject to availability and additional charges may apply. The property reserves the right to pre-authorize credit cards prior to arrival.",
    "checkinCheckoutTimes": {
      "checkin": "04:00 PM",
      "checkinStart": "04:00 PM",
      "checkout": "11:00 AM"
    },
    "hotelImages": [
      {
        "url": "https://snaphotelapi.com/hotels/322367676.jpg",
        "urlHd": "https://snaphotelapi.com/hotels-hd/322367676.jpg",
        "caption": "hotel building",
        "order": 1,
        "defaultImage": true
      },
      {
        "url": "https://snaphotelapi.com/hotels/399360240.jpg",
        "urlHd": "https://snaphotelapi.com/hotels-hd/399360240.jpg",
        "caption": "swimming pool",
        "order": 2,
        "defaultImage": false
      },
      {
        "url": "https://snaphotelapi.com/hotels/322367522.jpg",
        "caption": "room interior",
        "order": 3,
        "defaultImage": false
      }
    ],
    "country": "us",
    "city": "Myrtle Beach",
    "starRating": 2,
    "rating": 4.9,
    "reviewCount": 1599,
    "location": {
      "latitude": 33.67902,
      "longitude": -78.89426
    },
    "address": "703 South Ocean Boulevard",
    "hotelFacilities": [
      "WiFi available",
      "Free WiFi",
      "Parking",
      "Free Parking",
      "Outdoor Swimming Pool",
      "Beachfront",
      "Air Conditioning",
      "24-Hour Front Desk",
      "Non-Smoking Rooms",
      "Facilities for Disabled Guests",
      "Family Rooms",
      "Elevator",
      "Express Check-In/Check-Out",
      "Vending Machine (drinks)",
      "Vending Machine (snacks)",
      "BBQ Facilities",
      "Sun Terrace"
    ],
    "facilities": [
      {
        "facilityId": 47,
        "name": "WiFi available"
      },
      {
        "facilityId": 107,
        "name": "Free WiFi"
      },
      {
        "facilityId": 2,
        "name": "Parking"
      },
      {
        "facilityId": 14,
        "name": "Free Parking"
      }
    ],
    "rooms": [
      {
        "id": 5787126,
        "roomName": "Studio King",
        "description": "This studio includes an attached bathroom and a flat-screen TV and private balcony. The kitchenette features a stove, microwave and refrigerator.",
        "roomSizeSquare": 33,
        "roomSizeUnit": "m2",
        "hotelId": "57871",
        "maxAdults": 2,
        "maxChildren": 2,
        "maxOccupancy": 3,
        "bedTypes": [
          {
            "quantity": 1,
            "bedType": "Extra-large double bed(s) (Super-king size)",
            "bedSize": "181-210 cm wide"
          }
        ],
        "roomAmenities": [
          {
            "amenitiesId": 9,
            "name": "Telephone",
            "sort": 113
          },
          {
            "amenitiesId": 11,
            "name": "TV",
            "sort": 115
          },
          {
            "amenitiesId": 25,
            "name": "Air conditioning",
            "sort": 1
          },
          {
            "amenitiesId": 84,
            "name": "Flat-screen TV",
            "sort": 47
          },
          {
            "amenitiesId": 123,
            "name": "Private bathroom",
            "sort": 86
          }
        ],
        "photos": [
          {
            "url": "https://snaphotelapi.com/rooms-large-pictures/322367522.jpg",
            "imageDescription": "",
            "imageClass1": "hotel room",
            "imageClass2": "",
            "failoverPhoto": "https://q-xx.bstatic.com/xdata/images/hotel/max1200/322367522.jpg",
            "mainPhoto": false,
            "score": 4.53,
            "classId": 1,
            "classOrder": 1
          },
          {
            "url": "https://snaphotelapi.com/rooms-large-pictures/322367511.jpg",
            "imageDescription": "",
            "imageClass1": "hotel room",
            "imageClass2": "",
            "failoverPhoto": "https://q-xx.bstatic.com/xdata/images/hotel/max1200/322367511.jpg",
            "mainPhoto": false,
            "score": 4.55,
            "classId": 1,
            "classOrder": 1
          }
        ]
      },
      {
        "id": 5787127,
        "roomName": "Suite with Ocean View",
        "description": "Spacious suite featuring a separate living area, ocean view balcony, and full kitchen. Perfect for families or extended stays.",
        "roomSizeSquare": 50,
        "roomSizeUnit": "m2",
        "maxOccupancy": 4,
        "bedTypes": [
          {
            "quantity": 1,
            "bedType": "King-size bed",
            "bedSize": "181-200 cm wide"
          },
          {
            "quantity": 1,
            "bedType": "Sofa bed",
            "bedSize": "Variable"
          }
        ],
        "roomAmenities": [
          {
            "amenitiesId": 25,
            "name": "Air conditioning"
          },
          {
            "amenitiesId": 84,
            "name": "Flat-screen TV"
          },
          {
            "amenitiesId": 120,
            "name": "Ocean view"
          },
          {
            "amenitiesId": 45,
            "name": "Kitchen"
          }
        ],
        "photos": [
          {
            "url": "https://snaphotelapi.com/rooms-large-pictures/suite1.jpg",
            "imageDescription": "Suite living area"
          }
        ]
      }
    ]
  }
}
```

---

### 2. Hotel Reviews with Sentiment Analysis

**Request:**
```
GET https://api.liteapi.travel/v3.0/data/reviews?hotelId=lp3803c&getSentiment=true&limit=20
```

**Response:**
```json
{
  "data": [
    {
      "averageScore": 9,
      "country": "us",
      "type": "family with young children",
      "name": "Daisha",
      "date": "2024-06-20 04:10:14",
      "headline": "The stay was pleasant , the room was nice and clean",
      "language": "en",
      "pros": "it was beachfront , so it wasn't a far walk at all .",
      "cons": "the kitchen area could have been more nicer ."
    },
    {
      "averageScore": 4,
      "country": "us",
      "type": "young couple",
      "name": "Diandra",
      "date": "2024-06-20 23:46:40",
      "headline": "Palette Myrtle Beach spares every expense",
      "language": "en",
      "pros": "Spacious 1 bedroom Suite with a full kitchen. Comfy bed.",
      "cons": "Balcony door was stuck for duration of stay. Maintenance failed to fix on two attempts. Living room air conditioner was not producing cold air. The only other a c. unit in the suite was in the bedroom..."
    },
    {
      "averageScore": 8,
      "country": "us",
      "type": "solo traveler",
      "name": "Michael",
      "date": "2024-06-19 15:30:22",
      "headline": "Great beachfront location",
      "language": "en",
      "pros": "Perfect location right on the beach. Staff was friendly and helpful. Room was clean.",
      "cons": "WiFi was spotty in some areas. Parking lot was often full."
    }
  ],
  "sentimentAnalysis": {
    "categories": [
      {
        "name": "Cleanliness",
        "rating": 5.9,
        "description": "Mixed reviews on cleanliness with some guests mentioning dirty rugs, uncomfortable beds, and rude staff, while others appreciated the cleanliness of the rooms."
      },
      {
        "name": "Service",
        "rating": 7.6,
        "description": "Service was a point of contention, with some guests praising the friendly staff and the efforts to accommodate guests, but others complained about rude staff and long wait times for elevators."
      },
      {
        "name": "Location",
        "rating": 8.3,
        "description": "The hotel's location was a standout feature, with many guests appreciating its proximity to key landmarks and attractions, particularly the beachfront access."
      },
      {
        "name": "Room Quality",
        "rating": 4.9,
        "description": "Rooms received mixed reviews, with complaints about outdated rooms, uncomfortable beds, and noisy renovations, alongside positive comments about clean bedrooms and comfortable beds."
      },
      {
        "name": "Amenities",
        "rating": 6.7,
        "description": "Guests were divided on amenities, with some highlighting the lack of basic facilities like restaurant and lounges, while others appreciated the clean bedrooms and gym facilities."
      },
      {
        "name": "Value for Money",
        "rating": 5.5,
        "description": "Opinions on value for money were split, with some guests feeling the hotel was overpriced for the services offered, while others found it reasonable given the location."
      },
      {
        "name": "Food and Beverage",
        "rating": 6.9,
        "description": "Feedback on food and beverage services was mixed, with some guests criticizing the limited breakfast options, while others found it satisfactory."
      },
      {
        "name": "Overall Experience",
        "rating": 6.3,
        "description": "Most guests had a mixed experience, with some enjoying their stay and recommending the hotel, while others reported disappointing experiences."
      }
    ],
    "pros": [
      "Location",
      "Friendly staff",
      "Near Times Square",
      "Clean rooms",
      "View",
      "Bed cleanliness",
      "Beachfront access",
      "Ocean view",
      "Spacious rooms"
    ],
    "cons": [
      "Limited parking",
      "Expensive breakfast",
      "No spa services",
      "Dated rooms",
      "Uncomfortable beds",
      "Rude staff",
      "Noisy renovations",
      "Lack of basic amenities",
      "Overpriced rooms",
      "Limited food options",
      "Unsatisfactory value for money",
      "Heating issues",
      "Stained towels and bathrooms",
      "Delayed deposit refund",
      "WiFi connectivity issues"
    ]
  }
}
```

---

### 3. Rate Search with Room Mapping

**Request:**
```
POST https://api.liteapi.travel/v3.0/hotels/rates
```

**Body:**
```json
{
  "hotelIds": ["lp3803c"],
  "occupancies": [
    {
      "adults": 2,
      "children": 0
    }
  ],
  "currency": "USD",
  "guestNationality": "US",
  "checkin": "2025-12-30",
  "checkout": "2025-12-31",
  "roomMapping": true
}
```

**Response:**
```json
{
  "data": {
    "lp3803c": {
      "hotel_id": "lp3803c",
      "rates": [
        {
          "rateId": "rate_abc123",
          "mappedRoomId": 5787126,
          "roomName": "Studio King",
          "boardType": "Room Only",
          "price": {
            "amount": 129.99,
            "currency": "USD"
          },
          "cancellationPolicies": {
            "cancelPolicyInfos": [
              {
                "cancelTime": "2025-12-28 08:00:00",
                "amount": 129.99,
                "currency": "USD",
                "type": "amount",
                "timezone": "America/New_York"
              }
            ],
            "hotelRemarks": [],
            "refundableTag": "RFN"
          }
        },
        {
          "rateId": "rate_xyz789",
          "mappedRoomId": 5787127,
          "roomName": "Suite with Ocean View",
          "boardType": "Breakfast Included",
          "price": {
            "amount": 189.99,
            "currency": "USD"
          },
          "cancellationPolicies": {
            "cancelPolicyInfos": [
              {
                "cancelTime": "2025-12-28 08:00:00",
                "amount": 189.99,
                "currency": "USD",
                "type": "amount"
              }
            ],
            "refundableTag": "RFN"
          }
        }
      ]
    }
  }
}
```

---

### 4. Hotel Search Response

**Request:**
```
GET https://api.liteapi.travel/v3.0/data/hotels?countryCode=US&cityName=New%20York&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "id": "lp12345",
      "name": "Grand Plaza Hotel New York",
      "address": "123 Broadway",
      "city": "New York",
      "country": "us",
      "latitude": 40.7589,
      "longitude": -73.9851,
      "starRating": 4,
      "rating": 8.5,
      "reviewCount": 2341,
      "main_photo": "https://snaphotelapi.com/hotels/12345.jpg",
      "facilities": ["WiFi", "Gym", "Restaurant", "Bar"]
    },
    {
      "id": "lp67890",
      "name": "Times Square Boutique Hotel",
      "address": "789 7th Avenue",
      "city": "New York",
      "country": "us",
      "latitude": 40.7580,
      "longitude": -73.9855,
      "starRating": 3,
      "rating": 7.9,
      "reviewCount": 856,
      "main_photo": "https://snaphotelapi.com/hotels/67890.jpg",
      "facilities": ["WiFi", "Restaurant"]
    }
  ]
}
```

---

## Field Explanations

### Hotel Details Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | LiteAPI hotel identifier |
| `name` | string | Official hotel name |
| `hotelDescription` | string | HTML formatted description |
| `hotelImportantInformation` | string | Policies and requirements |
| `starRating` | number | Hotel category (1-5 stars) |
| `rating` | number | Guest review score (1-10) |
| `reviewCount` | number | Total number of reviews |
| `city` | string | City name |
| `country` | string | ISO-2 country code (lowercase) |
| `address` | string | Street address |
| `location.latitude` | number | GPS latitude |
| `location.longitude` | number | GPS longitude |
| `checkinCheckoutTimes.checkin` | string | Check-in time |
| `checkinCheckoutTimes.checkout` | string | Check-out time |
| `hotelFacilities` | array | Array of facility names (strings) |
| `facilities` | array | Array of facility objects with IDs |
| `rooms` | array | Array of room objects (with mapping) |

### Review Fields

| Field | Type | Description |
|-------|------|-------------|
| `averageScore` | number | Review score (1-10) |
| `country` | string | Reviewer's country (ISO-2) |
| `type` | string | Traveler type |
| `name` | string | Reviewer's name |
| `date` | string | Review date (YYYY-MM-DD HH:MM:SS) |
| `headline` | string | Review title |
| `language` | string | Review language (ISO-2) |
| `pros` | string | Positive comments |
| `cons` | string | Negative comments |

### Sentiment Analysis Fields

| Field | Type | Description |
|-------|------|-------------|
| `categories` | array | 8 category ratings |
| `categories[].name` | string | Category name |
| `categories[].rating` | number | Rating (1-10) |
| `categories[].description` | string | AI-generated explanation |
| `pros` | array | Array of common positive points |
| `cons` | array | Array of common negative points |

---

## Common Response Patterns

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Invalid hotel ID",
  "detail": "Hotel not found in database"
}
```

### Empty Results
```json
{
  "data": []
}
```

---

## Important Notes

1. **HTML in Description**: `hotelDescription` may contain HTML tags. Use `dangerouslySetInnerHTML` in React or sanitize.

2. **Image URLs**: Priority order:
   - `urlHd` (highest quality)
   - `url` (standard quality)
   - `failoverPhoto` (backup)

3. **Room Mapping**: Only available when:
   - `roomMapping: true` in rate search
   - Hotel is mapped in LiteAPI system
   - May not be available for all hotels

4. **Sentiment Analysis**: Only available when:
   - `getSentiment: true` in review request
   - Hotel has 1000+ reviews
   - May take longer to process

5. **Country Codes**: Always lowercase (us, gb, fr) in hotel data

6. **Dates**: Format is always `YYYY-MM-DD` for API, but display format varies in responses

7. **Ratings**:
   - `starRating`: 1-5 (hotel category)
   - `rating`: 1-10 (guest reviews)
   - `averageScore` (in reviews): 1-10

8. **Traveler Types**:
   - "family with young children"
   - "family with older children"
   - "young couple"
   - "couple"
   - "group of friends"
   - "solo traveler"
   - "business traveler"

---

This documentation provides all the reference data you need to understand LiteAPI responses and implement hotel details display!
