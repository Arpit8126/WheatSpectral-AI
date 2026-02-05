# HyperLeaf AI

A hyperspectral wheat analysis platform using React, Tailwind CSS, Five, and FastAPI.

## Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)

## Installation

### 1. Backend Setup
Navigate to the backend directory and set up the Python environment:

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
# source venv/bin/activate

pip install -r requirements.txt
```

### 2. Frontend Setup
Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

## Running the Application

You need to run two separate terminals.

### Terminal 1: Backend (API)
```bash
cd backend
# Make sure venv is activated
.\venv\Scripts\activate
python main.py
```
The API will start at `http://localhost:8000`.

### Terminal 2: Frontend (UI)
```bash
cd frontend
npm run dev
```
The website will be available at `http://localhost:5173` (or the port shown in the terminal, e.g., 5174).

## Project Structure
- **/frontend**: React + Vite application
- **/backend**: FastAPI application with mock inference logic
