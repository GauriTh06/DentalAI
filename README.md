# DentalAI Pro – AI-Powered Multi-Disease Dental Diagnostic System

DentalAI Pro is a clinical decision support system designed to assist dentists, radiologists, and patients in screening for multiple oral health conditions from medical imagery. It integrates deep convolutional neural networks, explainable AI overlays (Grad-CAM), patient progress tracking, a clinical remarks console for practitioners, and PDF diagnostic reports.

---

## 📂 Project Architecture

```
DentalPro/
├── docker-compose.yml        # Orchestrates MongoDB, FastAPI, and Nginx containers
├── README.md                 # System setup and API documentation
├── backend/
│   ├── app/
│   │   ├── config.py         # App environment variables & JWT secrets
│   │   ├── database.py       # Asynchronous Motor client connector
│   │   ├── auth.py           # Password hashing & role-based middleware (RBAC)
│   │   ├── main.py           # FastAPI lifecycle hooks & routes attachment
│   │   ├── models/           # Pydantic schemas (User, Scan, HealthScore)
│   │   ├── routes/           # Routing protocols (auth, predict, patient, admin, chat)
│   │   └── services/         # ML model loaders, Grad-CAM, & ReportLab PDF generators
│   ├── requirements.txt      # Python package configurations
│   └── Dockerfile            # Backend compilation container
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # React router routes & protected page guards
│   │   ├── index.css         # Google fonts & Tailwind variables
│   │   ├── components/       # Circular gauges, Navbar, and AI chatbot drawer
│   │   ├── pages/            # Landing page, login portal, patient and clinician consoles
│   │   └── services/         # Client-side API fetch client
│   ├── tailwind.config.js    # Custom CSS theme color parameters
│   ├── nginx.conf            # Nginx config for single-page routing (SPA)
│   └── Dockerfile            # Frontend compilation container
└── notebooks/
    ├── caries_training.ipynb       # EfficientNetB0 cavity training notebook
    ├── orthodontic_training.ipynb  # ResNet50 alignment training notebook
    └── oral_cancer_training.ipynb  # DenseNet121 lesion training notebook
```

---

## 🧠 AI Model Pipelines & Training

The system separates diagnostics into three specialized classification models (rather than a single model) because each model consumes different image domains (bitewing X-rays vs lateral cephalograms vs color photographs) and extracts unrelated clinical structures.

### A. Caries Detection (EfficientNetB0)
* **Dataset**: Kaggle Dental Caries Detection Dataset
* **Model**: EfficientNetB0 (Transfer learning with frozen base + fine-tuning block).
* **Classes**: `Healthy`, `Caries` (further graded into `Mild`, `Moderate`, `Severe` based on softmax outputs).
* **Notebook**: `notebooks/caries_training.ipynb`

### B. Orthodontic Alignment (ResNet50)
* **Dataset**: Cephalometric / Orthodontic X-Ray Dataset
* **Model**: ResNet50
* **Classes**: `Normal Alignment`, `Overbite`, `Underbite`, `Crowding`, `Spacing`.
* **Notebook**: `notebooks/orthodontic_training.ipynb`

### C. Oral Cancer Risk Assessment (DenseNet121)
* **Dataset**: Oral Cancer / Oral Lesion Dataset
* **Model**: DenseNet121 (Dense blocks extract local textures and mucosal boundary gradients).
* **Classes**: `Healthy Mucosa`, `Suspicious Oral Lesion`, `Malignancy Risk` (graded into Low, Moderate, High risk).
* **Notebook**: `notebooks/oral_cancer_training.ipynb`

---

## 🔑 Kaggle Dataset Download Integration

Each notebook contains integrated download blocks using the Kaggle API.

### 1. Download Kaggle API Token
1. Log in to [Kaggle](https://www.kaggle.com).
2. Go to your **Profile** -> **Settings**.
3. Under the **API** section, click **Create New Token**. This downloads a `kaggle.json` file.

### 2. Configure Credentials
* **Local Python environment**: Move `kaggle.json` to the home directory:
  * **Windows**: `C:\Users\<Username>\.kaggle\kaggle.json`
  * **Linux/macOS**: `~/.kaggle/kaggle.json`
* **Google Colab / Kaggle Notebooks**: Set environment variables:
  ```python
  import os
  os.environ['KAGGLE_USERNAME'] = "your_kaggle_username"
  os.environ['KAGGLE_KEY'] = "your_kaggle_api_key"
  ```

---

## 📊 Composite Dental Health Index

To summarize a patient's diagnostic profile, the platform aggregates findings into a single rating score out of **100**:
$$\text{Health Index} = \text{Caries Health (40 pts)} + \text{Alignment Health (30 pts)} + \text{Cancer Risk (30 pts)}$$

* **Caries Health ($40$ pts)**:
  * `Healthy`: $40$ pts
  * `Mild decay`: $30$ pts
  * `Moderate decay`: $20$ pts
  * `Severe decay`: $10$ pts
* **Alignment Health ($30$ pts)**:
  * `Normal`: $30$ pts
  * `Misalignment`: $30 - (\text{Severity Percentage} \times 0.2)$ pts (Min $5$ pts)
* **Cancer Risk ($30$ pts)**:
  * `Low Risk / Healthy`: $30$ pts
  * `Moderate / Suspicious`: $15$ pts
  * `High Risk / Cancer`: $5$ pts

### Health Classifications
* **$90$ – $100$**: Excellent (Emerald Theme)
* **$70$ – $89$**: Good (Teal Theme)
* **$50$ – $69$**: Moderate (Amber Theme)
* **Below $50$**: Critical (Rose Theme)

---

## 🚀 Running the Platform

### Method 1: Orchestration via Docker Compose (Recommended)
This compiles all dependencies, spins up a local MongoDB container, runs the backend, and serves the React dashboard at port 80 out of the box.

```bash
# Run from the root project directory
docker-compose up --build
```
* **Frontend Web App**: `http://localhost`
* **FastAPI Docs**: `http://localhost:8000/docs`

> [!NOTE]
> **Hybrid Model Fallback**: If you run the system without training the neural network notebooks first, the backend automatically activates a sophisticated mock inference engine. This engine computes realistic predictions (based on image hashes) and overlays simulated Grad-CAM heatmaps, allowing you to demo the interface, generate PDFs, and test database writes instantly.

### Method 2: Manual Local Running
If you want to run components separately for development:

#### 1. Setup Backend
```bash
cd backend
python -m venv venv
# Activate venv:
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
python app/main.py
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Access the dev server at: `http://localhost:5173`. Make sure a local MongoDB service is running on port 27017 or edit `MONGODB_URL` in `backend/app/config.py`.

---

## 🌐 API Reference

### 1. Authentication (`/auth`)
* `POST /api/auth/register` - Registers patients, dentists, or admins.
* `POST /api/auth/login` - Authenticates credentials and returns a JWT token.
* `GET /api/auth/me` - Retrives profile details.

### 2. Diagnosis Uploads (`/predict`)
* `POST /api/predict/caries` - Uploads a dental X-ray, returns cavity classification, confidence, and Grad-CAM base64.
* `POST /api/predict/orthodontic` - Uploads profile scans, returns jaw alignment and severity.
* `POST /api/predict/oral-cancer` - Uploads oral photo, returns tissue malignancy risks.
* `POST /api/predict/generate-health-index` - Re-evaluates composite rating.

### 3. Patient Portal (`/patient`)
* `GET /api/patient/history` - Returns list of scans uploaded by the patient.
* `GET /api/patient/health-trend` - Returns health index timeline nodes.
* `POST /api/patient/generate-report` - Assembles and downloads a ReportLab clinical PDF file.

### 4. Clinician Console (`/admin`)
* `GET /api/admin/analytics` - Returns platform statistics, scan ratios, and pathology chart points.
* `GET /api/admin/users` - Lists registered accounts.
* `GET /api/admin/scans` - Lists all patient scan logs.
* `POST /api/admin/scans/{scan_id}/review` - Allows dentists to input validation notes.

### 5. Chat Assistant (`/chat`)
* `POST /api/chat` - Connects to the personalized assistant.

---

## 🗄️ MongoDB Collections Schema

* **`users`**: `{ _id, name, email, hashed_password, role, created_at }`
* **`scans`**: `{ _id, patient_id, scan_type, image_url, prediction_result: { label, confidence, severity, severity_val, heatmap_url, recommendations }, dentist_notes, dentist_reviewed, created_at }`
* **`health_scores`**: `{ _id, patient_id, caries_score, orthodontic_score, cancer_score, total_score, status, created_at }`
* **`chat_history`**: `{ _id, user_id, message, response, created_at }`
