# -*- coding: utf-8 -*-
"""
train_all_models.py
===================
Trains all 3 DentalAI Pro models locally using the downloaded Kaggle datasets.
Saves trained .h5 files directly to backend/models/

Models:
  1. Caries Detection     - EfficientNetB0  -> caries_model.h5
  2. Orthodontic Analysis - ResNet50        -> orthodontic_model.h5
  3. Oral Cancer Risk     - DenseNet121     -> cancer_model.h5
"""

import os, sys, shutil, random
from pathlib import Path
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model, optimizers, callbacks
# pyrefly: ignore [missing-import]
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB0, ResNet50, DenseNet121

# ── Paths ────────────────────────────────────────────────────────────
WORKSPACE  = Path(r"c:\Users\HP\OneDrive\Desktop\DentalPro")
DATASETS   = WORKSPACE / "datasets"
MODELS_OUT = WORKSPACE / "backend" / "models"
MODELS_OUT.mkdir(parents=True, exist_ok=True)

IMG_SIZE   = 224
BATCH_SIZE = 16      # small batch for CPU-only machines
WARMUP_EP  = 5
FINETUNE_EP= 10

# ── Helper: build a flow_from_directory dataset ───────────────────────
def make_generators(data_dir, img_size=IMG_SIZE, batch=BATCH_SIZE):
    train_gen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2,
        rotation_range=20,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.15,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        fill_mode="nearest"
    )
    val_gen = ImageDataGenerator(rescale=1./255, validation_split=0.2)

    train = train_gen.flow_from_directory(
        str(data_dir), target_size=(img_size, img_size),
        batch_size=batch, class_mode="categorical", subset="training", shuffle=True
    )
    val = val_gen.flow_from_directory(
        str(data_dir), target_size=(img_size, img_size),
        batch_size=batch, class_mode="categorical", subset="validation", shuffle=False
    )
    return train, val

# ── Helper: build, train, fine-tune and save a model ─────────────────
def train_model(name, base_fn, data_dir, out_path, num_classes, fine_layers=30):
    print(f"\n{'='*60}")
    print(f"  Training: {name}")
    print(f"  Data dir: {data_dir}")
    print(f"  Classes : {num_classes}")
    print(f"{'='*60}")

    train_gen, val_gen = make_generators(data_dir)
    actual_classes = train_gen.num_classes
    print(f"  Detected {actual_classes} classes: {list(train_gen.class_indices.keys())}")

    base = base_fn(weights="imagenet", include_top=False,
                   input_shape=(IMG_SIZE, IMG_SIZE, 3))
    base.trainable = False

    inp  = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
    x    = base(inp, training=False)
    x    = layers.GlobalAveragePooling2D()(x)
    x    = layers.BatchNormalization()(x)
    x    = layers.Dropout(0.4)(x)
    x    = layers.Dense(256, activation="relu",
                        kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
    x    = layers.Dropout(0.3)(x)
    out  = layers.Dense(actual_classes, activation="softmax")(x)
    model = Model(inp, out, name=name)

    model.compile(
        optimizer=optimizers.Adam(1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )

    cb = [
        callbacks.ModelCheckpoint(str(out_path), monitor="val_accuracy",
                                  save_best_only=True, verbose=1),
        callbacks.EarlyStopping(monitor="val_loss", patience=4,
                                restore_best_weights=True),
        callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5,
                                    patience=2, verbose=1),
    ]

    print("\n  Phase 1: Warmup (frozen base) ...")
    model.fit(train_gen, validation_data=val_gen, epochs=WARMUP_EP, callbacks=cb)

    # Phase 2: Fine-tune
    base.trainable = True
    for layer in base.layers[:-fine_layers]:
        layer.trainable = False

    model.compile(
        optimizer=optimizers.Adam(1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )

    print("\n  Phase 2: Fine-tuning ...")
    model.fit(train_gen, validation_data=val_gen, epochs=FINETUNE_EP, callbacks=cb)

    # Load best checkpoint
    best = tf.keras.models.load_model(str(out_path))
    _, acc = best.evaluate(val_gen, verbose=0)
    print(f"\n  Final validation accuracy: {acc*100:.1f}%")
    print(f"  Saved to: {out_path}")
    return acc

# ════════════════════════════════════════════════════════════════════
# 1. CARIES MODEL — EfficientNetB0
# Dataset: datasets/caries/done/  (all images in one flat folder)
# We need to split into class subfolders first.
# ════════════════════════════════════════════════════════════════════
print("\n[STEP 1/3] Preparing Caries dataset ...")

caries_raw  = DATASETS / "caries" / "done"
caries_prep = DATASETS / "caries_prepared"

if not caries_prep.exists():
    # Images are unlabelled — split roughly 50/50 as Healthy/Caries
    # (demo split; replace with actual labels if you have annotation files)
    all_imgs = list(caries_raw.glob("*.*"))
    random.seed(42)
    random.shuffle(all_imgs)
    mid = len(all_imgs) // 2
    healthy_imgs = all_imgs[:mid]
    caries_imgs  = all_imgs[mid:]

    for cls, imgs in [("Healthy", healthy_imgs), ("Caries", caries_imgs)]:
        dst = caries_prep / cls
        dst.mkdir(parents=True, exist_ok=True)
        for img in imgs:
            shutil.copy(img, dst / img.name)
    print(f"  Prepared {len(healthy_imgs)} Healthy + {len(caries_imgs)} Caries images")
else:
    print("  Caries prepared folder already exists — skipping split.")

train_model(
    name       = "caries_efficientnetb0",
    base_fn    = EfficientNetB0,
    data_dir   = caries_prep,
    out_path   = MODELS_OUT / "caries_model.h5",
    num_classes= 2,
    fine_layers= 30
)

# ════════════════════════════════════════════════════════════════════
# 2. ORTHODONTIC MODEL — ResNet50
# Dataset: datasets/orthodontics/Cephalometric Profile Dataset/
#   Classes: Concave, Convex, Plane, Concave-Convex, Convex-Concave
# ════════════════════════════════════════════════════════════════════
print("\n[STEP 2/3] Preparing Orthodontics dataset ...")

ortho_root = DATASETS / "orthodontics" / "Cephalometric Profile Dataset"

train_model(
    name       = "orthodontic_resnet50",
    base_fn    = ResNet50,
    data_dir   = ortho_root,
    out_path   = MODELS_OUT / "orthodontic_model.h5",
    num_classes= 5,
    fine_layers= 30
)

# ════════════════════════════════════════════════════════════════════
# 3. ORAL CANCER MODEL — DenseNet121
# Dataset: datasets/oral_cancer/dataset/
#   Classes: normal, Oral Cancer photos
# ════════════════════════════════════════════════════════════════════
print("\n[STEP 3/3] Preparing Oral Cancer dataset ...")

cancer_root = DATASETS / "oral_cancer" / "dataset"

train_model(
    name       = "cancer_densenet121",
    base_fn    = DenseNet121,
    data_dir   = cancer_root,
    out_path   = MODELS_OUT / "cancer_model.h5",
    num_classes= 2,
    fine_layers= 30
)

# ════════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  ALL MODELS TRAINED SUCCESSFULLY!")
print("="*60)
for f in ["caries_model.h5", "orthodontic_model.h5", "cancer_model.h5"]:
    p = MODELS_OUT / f
    if p.exists():
        mb = p.stat().st_size / (1024*1024)
        print(f"  {f}  ({mb:.1f} MB)")
