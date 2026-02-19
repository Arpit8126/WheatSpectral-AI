# WheatSpectral AI — Complete Project Documentation

WheatSpectral AI is a full-stack precision-agriculture platform for wheat, combining hyperspectral image analysis, AI inference, farm input planning, mandi market comparison, and profit strategy generation.

It is designed for farmers, agronomists, and admins to:
- Upload hyperspectral wheat images (`.tif` expected by backend)
- Predict cultivar + physiological traits
- Estimate production, urea requirement, and fertilizer cost
- Compare live mandi prices from India (Agmarknet)
- Compute best market strategy and estimated net profit
- Generate a downloadable multi-page health/economic report PDF
- Use the interface in English and Hindi

---

## 1) Core Features Implemented

### A. AI-powered Wheat Analysis
- **Input**: Hyperspectral cube expected shape: `[204, 48, 352]`
- **Model**: `1D+2D CNN + Axial Attention.pt` loaded through `FusionNet`
- **Classification output**:
  - Cultivar prediction (`Heerup`, `Kvium`, `Rembrandt`, `Sheriff`)
  - Confidence score
  - Probability distribution across cultivars
- **Regression outputs**:
  - Grain Weight (`mg/plant`)
  - GSW (stomatal conductance)
  - PhiPS2 (photosynthesis efficiency)
  - Fertilizer Score

### B. Agronomic & Economic Computations
Implemented in backend prediction service:

1. **Total Estimated Wheat Production (quintals)**
\[
\text{total\_production\_quintals} = \frac{\text{grain\_weight} \times \text{plant\_density\_per\_acre} \times \text{field\_area}}{\text{mg\_to\_quintal}}
\]
Where:
- `plant_density_per_acre = 150,000`
- `mg_to_quintal = 100,000,000`

2. **Total Required Urea (kg)**
\[
\text{urea\_per\_acre} = (1 - \text{clip}(\text{fertilizer\_score}, 0, 1)) \times 110
\]
\[
\text{urea\_required\_kg} = \text{urea\_per\_acre} \times \text{field\_area}
\]

3. **Urea/Fertilizer Cost (₹)**
\[
\text{fertilizer\_cost\_inr} = \text{urea\_required\_kg} \times \text{fertilizer\_rate\_inr}
\]

### C. Mandi Comparison (India-wide Market Linkage)
- Pulls mandi price records from **Agmarknet API** (data.gov.in)
- Supports distance-aware filtering using user GPS (or default coordinates)
- Calculates mandi distances using Haversine formula
- Returns alternative markets and recommended mandi
- Includes API-fallback mode with mock mandi prices when live API is unavailable

### D. Best Deal + Estimated Net Profit Strategy
For each candidate mandi, backend computes:

1. **Gross revenue**
\[
\text{gross\_revenue} = \text{total\_production\_quintals} \times \text{mandi\_modal\_price}
\]

2. **Transportation + fixed logistics cost**
\[
\text{variable\_transport} = \text{distance\_km} \times 0.50 \times \text{total\_production\_quintals}
\]
\[
\text{transport\_cost} = \text{variable\_transport} + 1000
\]

3. **Net revenue before farm input deduction**
\[
\text{net\_revenue} = \text{gross\_revenue} - \text{transport\_cost}
\]

4. **Final estimated net profit**
\[
\text{net\_profit} = \text{best\_net\_revenue} - \text{fertilizer\_cost\_inr}
\]

This reflects your requirement: compare all mandis and find the best deal by subtracting transportation + fixed cost and then deducting production/input cost (currently fertilizer cost stored in system).

### E. Complete Health Report + PDF Export
The analysis dashboard provides:
- Farming report (production, urea, cost)
- Physiological indicators (grain weight, GSW, PhiPS2, fertilizer score)
- Spectral reflectance visualization
- Market strategy panel (best mandi + alternatives)
- **Downloadable multi-page PDF report** generated client-side (`html2canvas + jsPDF`)

### F. Multilingual Web App
- Implemented with `i18next` + `react-i18next`
- Languages available:
  - English (`en`)
  - Hindi (`hi`)
- Language toggle present in navbar

### G. User Roles & Dashboard History
- JWT-based auth
- Roles:
  - `farmer`: own predictions/history
  - `admin`: view all farmers and filter by farmer
- Every prediction is stored in database with timestamps and market strategy persistence fields

---

## 2) Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS
- Recharts
- Framer Motion
- i18next
- html2canvas + jsPDF
- Three.js + react-three-fiber + drei

### Backend
- FastAPI
- PyTorch
- tifffile / NumPy
- SQLAlchemy ORM
- PostgreSQL
- Python JWT auth (`python-jose`)

---

## 3) Project Structure (High-level)

- `hyperleaf-ai/backend/`
  - API (`main.py`), auth (`auth.py`), model inference (`prediction_service.py`)
  - Market strategy (`market_service.py`)
  - DB models/schemas (`models.py`, `schemas.py`, `database.py`)
- `hyperleaf-ai/frontend/`
  - React pages (`Home`, `Demo`, `Dashboard`, `Research`, `Login`, `Signup`)
  - Analysis UI and report generation
  - Language resources (`src/i18n.js`)

---

## 4) API Overview

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Prediction
- `POST /api/predict`
  - multipart form: `file`, `field_area`, `fertilizer_rate`
  - returns prediction + computed agronomic metrics

### Dashboard
- `GET /api/dashboard`
- `GET /api/admin/users` (admin only)

### Market
- `GET /api/market/prices?crop=Wheat&lat=&lon=`
- `POST /api/market/strategy?prediction_id=<id>`
  - optional form fields: `lat`, `lon`

---

## 5) Setup & Run Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Model file in backend folder:
  - `1D+2D CNN + Axial Attention.pt`

### A) Backend Setup
```bash
cd hyperleaf-ai/backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
# source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` in `hyperleaf-ai/backend`:
```env
DATABASE_URL=postgresql://username:password@localhost/spectral_wheat_db
SECRET_KEY=your_secret_key_here
AGMARKNET_API_KEY=your_agmarknet_api_key_here
```

Initialize DB/tables:
```bash
python create_db.py
```

Run backend:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### B) Frontend Setup
```bash
cd hyperleaf-ai/frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`  
Backend URL: `http://localhost:8000`

---

## 6) End-to-End User Flow

1. User signs up / logs in
2. User uploads hyperspectral image and enters field area + fertilizer rate
3. Backend predicts cultivar + physiological metrics
4. System estimates total production, urea requirement, and fertilizer cost
5. In Market tab, user fetches mandi strategy using GPS/default location
6. System compares mandis and recommends best one by net profit
7. User downloads complete PDF report (health + economics + market + spectral graph)
8. Results are stored in dashboard history

---

## 7) Notes & Current Behavior

- Prediction endpoint strictly expects hyperspectral shape `[204, 48, 352]`
- Market service filters out very far mandis (default threshold <300 km) for recommendation quality
- If live Agmarknet data is unavailable, fallback mock data is used for continuity
- Net profit currently deducts fertilizer cost as main persisted input cost; additional fixed operational costs can be extended in future

---

## 8) Future Enhancements (Optional)

- Add custom user-entered fixed costs (labor, diesel, irrigation, etc.) to net profit equation
- Extend market geocoding to all Indian districts dynamically
- Add Punjabi and other regional language packs
- Persist uploaded image files to object storage (S3/Azure/GCS)
- Add role-based analytics exports for admin users

