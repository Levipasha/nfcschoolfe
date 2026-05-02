# NFC Admin App

Admin frontend for managing profiles using existing `nfcschoolbe` backend.

## Features

- OTP admin login (`/api/admin/send-otp`, `/api/admin/verify-otp`)
- View all general profiles
- Search/filter by profile type (restaurant or other)
- Live counts (total, restaurant, other)
- Edit profile fields including `theme` and `profileType`
- Delete profiles
- Basic global stats from `/api/admin/stats`

## Setup

1. Copy `.env.example` to `.env`
2. Set `VITE_API_URL` to backend URL (example: `http://localhost:5000`)
3. Install and run:

```bash
npm install
npm run dev
```
