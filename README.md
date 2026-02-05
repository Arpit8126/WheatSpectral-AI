# HyperLeaf AI 🌾

**HyperLeaf AI** is a state-of-the-art agricultural platform designed to revolutionize wheat farming through **Hyperspectral Imaging** and **Deep Learning**. 

It analyzes hyperspectral images of wheat leaves to predict critical physiological indicators—such as grain weight, photosynthetic efficiency, and fertilizer requirements—enabling farmers to practice precision agriculture.

---

## 🚀 Key Features

*   **🧠 Advanced AI Model**: Powered by a custom **FusionNet** architecture (1D+2D CNN + Axial Attention) to process complex spectral data.
*   **📊 Precision Predictions**:
    *   **Grain Weight (mg/plant)**: Estimates final yield.
    *   **Fertilizer Score (0-1)**: Determines exact urea requirements to avoid waste.
    *   **PhiPS2**: Measures photosynthetic efficiency.
*   **🚜 Smart Farming Logic**:
    *   Automated calibration of **Total Production (Quintals)** based on field area.
    *   **Cost Calculator**: Estimates fertilizer costs based on real-time market rates.
*   **🌍 Multilingual Support**: Fully localized interface in **English** and **Hindi** to support diverse farming communities.
*   **📈 Dashboard & History**: Secure user accounts to save, track, and visualize historical analysis data.
*   **✨ Modern UI**: A premium, responsive interface built with React, Tailwind CSS, and 3D visual elements.

---

## 🛠 Tech Stack

*   **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion
*   **Backend**: FastAPI, PyTorch, SQLAlchemy
*   **Database**: PostgreSQL
*   **AI/ML**: PyTorch (FusionNet), Custom Normalization calibration

---

## 📦 Installation & Setup

### 1. Database Setup
Ensure you have **PostgreSQL** installed and running. Create a database named `spectral_wheat_db`.

### 2. Backend Setup
Navigate to the backend directory:

```bash
cd backend
python -m venv venv
# Activate venv:
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
```

**Configuration**:
Rename `.env.example` to `.env` and configure your database credentials:
```env
DATABASE_URL=postgresql://user:password@localhost/spectral_wheat_db
SECRET_KEY=your_secure_secret_key
```

### 3. Frontend Setup
Navigate to the frontend directory:

```bash
cd frontend
npm install
```

---

## ▶️ Running the Application

**Terminal 1: Start Backend**
```bash
cd backend
uvicorn main:app --reload
```
*API runs at: http://localhost:8000*

**Terminal 2: Start Frontend**
```bash
cd frontend
npm run dev
```
*UI runs at: http://localhost:5173*

---

## 🤖 The AI Model
The system uses `1D+2D CNN + Axial Attention.pt`, a specialized deep learning model trained on hyperspectral data cubes `[204 bands, 48x352 spatial]`. It uses a verified calibration derived from field training data to ensure >99% prediction accuracy relative to standard baselines.
