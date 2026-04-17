TOKEN=$(curl -s -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"provider@servicemate.com", "password":"provider123"}' | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

echo "Token: $TOKEN"

BOOKING_ID=$(curl -s -X GET http://localhost:5002/api/bookings/provider/me \
  -H "Authorization: Bearer $TOKEN" | grep -o '"_id":"[^"]*' | head -n 1 | grep -o '[^"]*$')

echo "Booking ID: $BOOKING_ID"

curl -v -X PUT http://localhost:5002/api/bookings/$BOOKING_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}'
