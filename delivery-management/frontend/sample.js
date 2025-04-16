export const order = {
  "_id": "6512e8a1b3e7d62a3f8c9d2e",
  "orderId": "ORD-250415-0001",
  "customerId": "650abc123def456789012345",
  "customerName": "John Doe",
  "customerEmail": "john.doe@example.com",
  "customerPhone": "+1-555-123-4567",
  "type": "DELIVERY",
  "restaurantOrder": {
    "restaurantId": "650def789abc123456789012",
    "restaurantName": "Taste of India",
    "restaurantLocation": {
      "lat": 7.2911,  
      "lng": 80.6365 
    },
    "items": [],
    "subtotal": 43.95,
    "deliveryFee": 4.99,
    "tax": 3.87,
    "status": "OUT_FOR_DELIVERY",
    "statusHistory": [
      {
        "status": "PLACED",
        "timestamp": "2025-04-15T14:30:00.000Z",
        "updatedBy": "650abc123def456789012345",
        "notes": "Order placed through mobile app"
      },
      {
        "status": "CONFIRMED",
        "timestamp": "2025-04-15T14:32:15.000Z",
        "updatedBy": "650def789abc123456789012",
        "notes": "Order accepted by restaurant"
      },
      {
        "status": "PREPARING",
        "timestamp": "2025-04-15T14:40:00.000Z",
        "updatedBy": "650def789abc123456789012",
        "notes": "Kitchen started preparing"
      },
      {
        "status": "READY_FOR_PICKUP",
        "timestamp": "2025-04-15T15:10:00.000Z",
        "updatedBy": "650def789abc123456789012",
        "notes": "Order is ready for delivery"
      },
      {
        "status": "OUT_FOR_DELIVERY",
        "timestamp": "2025-04-15T15:15:00.000Z",
        "updatedBy": "653cba987fed654321098765",
        "notes": "Driver picked up the order"
      }
    ],
    "estimatedReadyTime": "2025-04-15T15:10:00.000Z",
    "actualReadyTime": "2025-04-15T15:07:32.000Z",
    "specialInstructions": "Please include extra napkins and utensils"
  },
  "deliveryAddress": {
    "street": "45 Katugastota Main Road, Near Railway Station",
    "city": "Katugastota",
    "state": "CP",
    "zipCode": "20800",
    "country": "Sri Lanka",
    "coordinates": {
      "lat": 7.3215,
      "lng": 80.6149
    }
  },
  "deliveryPerson": {
    "id": "653cba987fed654321098765",
    "name": "Michael Rodriguez",
    "phone": "+1-555-987-6543",
    "vehicleDetails": "Honda Scooter, Black",
    "vehicleNumber": "NY5432",
    "rating": 4.8,
    "profileImage": "https://example.com/drivers/michael_profile.jpg",
    "assignedAt": "2025-04-15T15:12:00.000Z",
    "currentLocation": {
      "lat": 40.7300,
      "lng": -73.9950,
      "updatedAt": "2025-04-15T15:25:30.000Z"
    }
  },
  "estimatedDeliveryTime": "2025-04-15T15:35:00.000Z",
  "actualDeliveryTime": null,
  "totalAmount": 52.81,
  "paymentMethod": "CARD",
  "paymentStatus": "PAID",
  "paymentDetails": {
    "transactionId": "txn_125abcdefghijklmno",
    "paymentProcessor": "Stripe",
    "cardLastFour": "4242",
    "receiptUrl": "https://payments.example.com/receipts/txn_125abcdefghijklmno"
  },
  "customerNotified": true,
  "customerNotificationHistory": [
    {
      "type": "ORDER_CONFIRMED",
      "timestamp": "2025-04-15T14:32:30.000Z",
      "success": true,
      "details": "SMS sent to +1-555-123-4567"
    },
    {
      "type": "STATUS_UPDATE",
      "timestamp": "2025-04-15T15:10:15.000Z",
      "success": true,
      "details": "Email sent: Your order is ready for pickup"
    },
    {
      "type": "STATUS_UPDATE",
      "timestamp": "2025-04-15T15:15:30.000Z",
      "success": true,
      "details": "SMS sent: Your order is on the way with Michael"
    }
  ],
  "createdAt": "2025-04-15T14:30:00.000Z",
  "updatedAt": "2025-04-15T15:25:30.000Z"
}
