# 🦷 DentalAI Pro — Model Training Guide

This guide explains how to train the three AI models that power DentalAI Pro.

---

## 📁 File Structure

```
DentalPro/
├── backend/
│   ├── models/                    ← Trained .h5 files go here
│   │   ├── caries_model.h5
│   │   ├── orthodontic_model.h5
│   │   └── cancer_model.h5
│   └── generate_demo_models.py    ← Quick demo model generator
└── notebooks/
    ├── train_caries_colab.py      ← Colab training script (EfficientNetB0)
    ├── train_orthodontic_colab.py ← Colab training script (ResNet50)
    └── train_oral_cancer_colab.py ← Colab training script (DenseNet121)
```

---

## 🚀 Option A — Quick Start (Demo Models, No Dataset Needed)

This generates structurally correct `.h5` model files that allow the backend to
load and run — predictions will be random but the pipeline is fully tested.

```powershell
# From the DentalPro/backend directory
pip install tensorflow pillow numpy
python generate_demo_models.py
```

The script creates:
- `backend/models/caries_model.h5`      (~22 MB)
- `backend/models/orthodontic_model.h5` (~91 MB)
- `backend/models/cancer_model.h5`      (~28 MB)

> **Note**: Demo models produce random predictions. Use Option B for real diagnostics.

---

## 🎓 Option B — Full Training on Kaggle Datasets (Google Colab — Recommended)

### Prerequisites

1. A free [Kaggle account](https://www.kaggle.com)
2. A free [Google Colab](https://colab.research.google.com) account (GPU provided free)
3. Your Kaggle API key (`kaggle.json`)

### Step 1 — Get Your Kaggle API Key

1. Go to [kaggle.com/settings](https://www.kaggle.com/settings)
2. Scroll to **API** section → click **"Create New Token"**
3. This downloads `kaggle.json` with your credentials

### Step 2 — Open a Training Script in Colab

| Model | Script | Colab Link |
|-------|--------|------------|
| Caries (EfficientNetB0) | `notebooks/train_caries_colab.py` | [Open in Colab](https://colab.research.google.com/github/) |
| Orthodontic (ResNet50) | `notebooks/train_orthodontic_colab.py` | [Open in Colab](https://colab.research.google.com/github/) |
| Oral Cancer (DenseNet121) | `notebooks/train_oral_cancer_colab.py` | [Open in Colab](https://colab.research.google.com/github/) |

### Step 3 — Set Up GPU Runtime

In Colab: **Runtime → Change runtime type → T4 GPU**

### Step 4 — Enter Your Kaggle Credentials

In the script, replace these two lines:
```python
os.environ["KAGGLE_USERNAME"] = "YOUR_KAGGLE_USERNAME"
os.environ["KAGGLE_KEY"]      = "YOUR_KAGGLE_API_KEY"
```

Or you can use the file upload method (uncomment those lines in Step 1 of the script).

### Step 5 — Run All Cells

The script automatically:
1. Downloads the dataset from Kaggle
2. Applies data augmentation
3. Trains with warm-up + fine-tuning (two-phase transfer learning)
4. Generates confusion matrix, ROC curves, and Grad-CAM visualizations
5. Saves and **auto-downloads** the final `.h5` model to your computer

### Step 6 — Copy Models to Backend

Place the downloaded files here:
```
DentalPro/
└── backend/
    └── models/
        ├── caries_model.h5         ← from Colab
        ├── orthodontic_model.h5    ← from Colab
        └── cancer_model.h5         ← from Colab
```

---

## 🗂️ Dataset Information

### 1. Dental Caries Detection
| Property | Value |
|----------|-------|
| Kaggle Slug | `imtkaggleteam/dental-caries` |
| Image Type | Periapical X-rays |
| Classes | Healthy, Caries |
| Model | EfficientNetB0 |
| Input Size | 224×224 |

### 2. Orthodontic Analysis
| Property | Value |
|----------|-------|
| Kaggle Slug | `awsaf49/cephalometric-landmark-detection` |
| Image Type | Cephalometric X-rays |
| Classes | Normal, Overbite, Underbite, Crowding, Spacing |
| Model | ResNet50 |
| Input Size | 224×224 |

### 3. Oral Cancer Risk
| Property | Value |
|----------|-------|
| Kaggle Slug | `zaidpy/oral-cancer-dataset` |
| Image Type | Oral cavity photographs |
| Classes | Healthy, Suspicious, Cancer |
| Model | DenseNet121 |
| Input Size | 224×224 |
| Loss | Focal Loss (handles class imbalance) |

---

## 🏗️ Model Architecture Summary

### Caries — EfficientNetB0

```
Input (224×224×3)
    ↓
EfficientNetB0 backbone (ImageNet weights)
    ↓
GlobalAveragePooling2D
    ↓
BatchNorm → Dropout(0.3)
    ↓
Dense(256, relu) + L2 regularizer
    ↓
Dropout(0.2)
    ↓
Dense(2, softmax)  ← [Healthy, Caries]
```

### Orthodontic — ResNet50

```
Input (224×224×3)
    ↓
ResNet50 backbone (ImageNet weights)
    ↓
GlobalAveragePooling2D
    ↓
BatchNorm → Dropout(0.4)
    ↓
Dense(512, relu) → BatchNorm → Dropout(0.3)
    ↓
Dense(256, relu) → Dropout(0.2)
    ↓
Dense(5, softmax)  ← [Normal, Overbite, Underbite, Crowding, Spacing]
```

### Oral Cancer — DenseNet121

```
Input (224×224×3)
    ↓
DenseNet121 backbone (ImageNet weights)
    ↓
GlobalAveragePooling2D
    ↓
BatchNorm → Dropout(0.5)
    ↓
Dense(512, relu) + L2 → BatchNorm → Dropout(0.4)
    ↓
Dense(256, relu) + L2 → Dropout(0.3)
    ↓
Dense(128, relu) → Dropout(0.2)
    ↓
Dense(3, softmax) + Focal Loss ← [Healthy, Suspicious, Cancer]
```

---

## 📊 Training Strategy (Two-Phase Transfer Learning)

| Phase | Layers Frozen | LR | Epochs |
|-------|-------------|-----|--------|
| **Warm-up** | All base layers | 1e-3 | 5–8 |
| **Fine-tuning** | Top 30–60 layers unfrozen | 5e-6 | 15–20 |

**Callbacks used**: `ModelCheckpoint`, `EarlyStopping`, `ReduceLROnPlateau`, `TensorBoard`

---

## ⚠️ Important Notes

> [!WARNING]
> These models are intended for research and educational purposes. They should **not** be used for actual clinical diagnosis without validation by licensed dental professionals.

> [!TIP]
> For best results, train caries and cancer models first (smaller datasets, faster training). Orthodontic training may take 30–60 minutes on a Colab T4 GPU.

> [!NOTE]
> If a Kaggle dataset slug fails (404), the training scripts automatically try fallback slugs. You can also manually search [kaggle.com/datasets](https://kaggle.com/datasets) and update the `DATASET_SLUG` variable.
