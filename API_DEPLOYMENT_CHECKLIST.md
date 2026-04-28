# API Deployment Checklist

## Before Deployment
- [ ] Verify all API endpoints work locally
- [ ] Test: http://localhost:3000/api/books.json
- [ ] Test: http://localhost:3000/api/likutay-moharan/part-1/1.json
- [ ] Test: http://localhost:3000/api/search-index.json
- [ ] Test: http://localhost:3000/api/daily-wisdom.json

## Deployment Steps
- [ ] Login to Namecheap cPanel (petteknanach / NaNach2026!)
- [ ] Open File Manager
- [ ] Navigate to public_html/
- [ ] Create "api" directory (if not exists)
- [ ] Upload all files from api-mobile/ to api/
- [ ] Set permissions: 755 for directories, 644 for files

## After Deployment
- [ ] Test: https://ajew.org/api/books.json
- [ ] Test: https://ajew.org/api/likutay-moharan/part-1/1.json
- [ ] Test: https://ajew.org/api/search-index.json
- [ ] Test: https://ajew.org/api/daily-wisdom.json
- [ ] Test: https://ajew.org/api/info.json

## Update Mobile App
- [ ] Edit AjewAPI.js
- [ ] Change API_BASE_URL to "https://ajew.org/api"
- [ ] Test app with production API
- [ ] Verify fallback still works if API fails

## Monitoring
- [ ] Check server logs for API access
- [ ] Monitor API response times
- [ ] Plan weekly content expansion
- [ ] Collect user feedback for improvements

## Success Metrics
- [ ] API responds in < 500ms
- [ ] All endpoints return valid JSON
- [ ] Mobile app works with production API
- [ ] Users can access Breslov wisdom

Na Nach Nachma Nachman Me'Uman! 🦞