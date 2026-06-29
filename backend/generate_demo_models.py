# -*- coding: utf-8 -*-
import sys, io
# Force UTF-8 output on Windows terminals
if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

"""
generate_demo_models.py
=======================
Generates lightweight placeholder .h5 models for immediate testing of the
DentalAI Pro backend WITHOUT requiring a GPU or a real dataset.

These models use correct architecture (EfficientNetB0 / ResNet50 / DenseNet121)
with transfer learning but are NOT trained on real data — they produce random
predictions. Replace with real .h5 files after Colab training.

Usage:
    cd DentalPro/backend
    pip install tensorflow pillow numpy
    python generate_demo_models.py
"""

import os
import sys
from pathlib import Path

MODELS_DIR = Path(__file__).resolve().parent / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

print("=" * 60)
print("  DentalAI Pro — Demo Model Generator")
print("=" * 60)

try:
    import tensorflow as tf
    from tensorflow.keras import layers, Model
    from tensorflow.keras.applications import EfficientNetB0, ResNet50, DenseNet121
    print(f"  TensorFlow version: {tf.__version__}")
except ImportError:
    print("\n[ERROR] TensorFlow is not installed.")
    print("  Run: pip install tensorflow")
    sys.exit(1)

IMG_SIZE = 224


def build_caries_model() -> Model:
    """EfficientNetB0 — 2 classes: Healthy / Caries"""
    base = EfficientNetB0(
        weights=None,           # random weights for demo
        include_top=False,
        input_shape=(IMG_SIZE, IMG_SIZE, 3)
    )
    x = layers.GlobalAveragePooling2D()(base.output)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(2, activation="softmax", name="caries_output")(x)
    model = Model(base.input, outputs, name="caries_efficientnetb0")
    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model


def build_orthodontic_model() -> Model:
    """ResNet50 — 5 classes: Normal / Overbite / Underbite / Crowding / Spacing"""
    base = ResNet50(
        weights=None,
        include_top=False,
        input_shape=(IMG_SIZE, IMG_SIZE, 3)
    )
    x = layers.GlobalAveragePooling2D()(base.output)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(128, activation="relu")(x)
    outputs = layers.Dense(5, activation="softmax", name="ortho_output")(x)
    model = Model(base.input, outputs, name="orthodontic_resnet50")
    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model


def build_cancer_model() -> Model:
    """DenseNet121 — 3 classes: Healthy / Suspicious / Cancer"""
    base = DenseNet121(
        weights=None,
        include_top=False,
        input_shape=(IMG_SIZE, IMG_SIZE, 3)
    )
    x = layers.GlobalAveragePooling2D()(base.output)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.5)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(128, activation="relu")(x)
    outputs = layers.Dense(3, activation="softmax", name="cancer_output")(x)
    model = Model(base.input, outputs, name="cancer_densenet121")
    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model


MODELS = [
    ("Caries Detection (EfficientNetB0)",  build_caries_model,       "caries_model.h5"),
    ("Orthodontic Analysis (ResNet50)",    build_orthodontic_model,  "orthodontic_model.h5"),
    ("Oral Cancer Risk (DenseNet121)",     build_cancer_model,       "cancer_model.h5"),
]

for name, builder_fn, filename in MODELS:
    save_path = MODELS_DIR / filename
    if save_path.exists():
        print(f"\n  [SKIP] {filename} already exists — delete it to regenerate.")
        continue
    print(f"\n  Building: {name} ...")
    model = builder_fn()
    total_params = model.count_params()
    print(f"    Parameters: {total_params:,}")
    model.save(str(save_path))
    size_mb = save_path.stat().st_size / (1024 * 1024)
    print(f"    Saved to:  {save_path}  ({size_mb:.1f} MB)")

print("\n" + "=" * 60)
print("  [OK] All demo models generated successfully!")
print(f"  [DIR] Location: {MODELS_DIR}")
print()
print("  IMPORTANT: These models produce RANDOM predictions.")
print("  To get real clinical accuracy, train on Kaggle datasets")
print("  using the notebooks in notebooks/ (run on Google Colab).")
print("=" * 60)
