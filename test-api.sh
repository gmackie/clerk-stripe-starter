#!/bin/bash

# Test API endpoint without authentication (should fail)
echo "Testing API without auth..."
curl -X GET http://localhost:3000/api/example

echo -e "\n\nTo test with API key:"
echo "1. Login to http://localhost:3000"
echo "2. Go to /settings"
echo "3. Generate an API key"
echo "4. Run: curl -X GET http://localhost:3000/api/example -H 'Authorization: Bearer YOUR_API_KEY'"

echo -e "\n\nTo test rate limiting:"
echo "Run this command multiple times quickly to hit rate limits"