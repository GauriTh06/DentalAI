# ╔══════════════════════════════════════════════════════════════════╗
# ║         DentalAI Pro — Caries Detection Training Script         ║
# ║         Model: EfficientNetB0 (Transfer Learning)               ║
# ║         Dataset: Dental Caries Detection (Kaggle)               ║
# ║         Target: backend/models/caries_model.h5                  ║
# ║                                                                  ║
# ║  INSTRUCTIONS:                                                   ║
# ║  1. Upload this file to Google Colab or Kaggle Notebooks        ║
# ║  2. Enable GPU Runtime: Runtime > Change Runtime Type > GPU     ║
# ║  3. Set your Kaggle API credentials (see Step 1 below)          ║
# ║  4. Run all cells                                                ║
# ╚══════════════════════════════════════════════════════════════════╝

# ─────────────────────────────────────────────────────────────────────
# STEP 0 — Install dependencies
# ─────────────────────────────────────────────────────────────────────
import subprocess, sys

def install(pkg):
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", pkg])

install("kaggle")
install("tensorflow>=2.15")
install("scikit-learn")
install("matplotlib")
install("seaborn")
install("opencv-python-headless")

# ─────────────────────────────────────────────────────────────────────
# STEP 1 — Kaggle Authentication
# ─────────────────────────────────────────────────────────────────────
# Option A: Upload kaggle.json via Colab file upload
# from google.colab import files
# files.upload()   # upload your kaggle.json

# Option B: Set credentials directly (fill in your details)
import os
os.environ["KAGGLE_USERNAME"] = "YOUR_KAGGLE_USERNAME"  # ← Replace
os.environ["KAGGLE_KEY"]      = "YOUR_KAGGLE_API_KEY"   # ← Replace

import os, shutil
from pathlib import Path

# Create the ~/.kaggle directory and config
kaggle_dir = Path.home() / ".kaggle"
kaggle_dir.mkdir(parents=True, exist_ok=True)
kaggle_json = kaggle_dir / "kaggle.json"

if not kaggle_json.exists():
    import json
    config = {
        "username": os.environ["KAGGLE_USERNAME"],
        "key":      os.environ["KAGGLE_KEY"]
    }
    with open(kaggle_json, "w") as f:
        json.dump(config, f)
    kaggle_json.chmod(0o600)
    print("✅ kaggle.json created")

# ─────────────────────────────────────────────────────────────────────
# STEP 2 — Download Dataset
# ─────────────────────────────────────────────────────────────────────
DATA_ROOT = Path("/content/dental_data/caries")
DATA_ROOT.mkdir(parents=True, exist_ok=True)

# Primary: Dental Caries Detection dataset (TCIA-sourced)
DATASET_SLUG = "imtkaggleteam/dental-caries"   # change if slug differs

print(f"Downloading dataset: {DATASET_SLUG} ...")
os.system(f"kaggle datasets download -d {DATASET_SLUG} -p {DATA_ROOT} --unzip")

# Fallback slug — try if primary fails
fallback_slug = "salmansajid/dental-caries-detection"
if not any(DATA_ROOT.glob("**/*.jpg")) and not any(DATA_ROOT.glob("**/*.png")):
    print("Primary slug failed. Trying fallback ...")
    os.system(f"kaggle datasets download -d {fallback_slug} -p {DATA_ROOT} --unzip")

# List what we got
import glob
img_files = glob.glob(str(DATA_ROOT / "**" / "*.jpg"), recursive=True) + \
            glob.glob(str(DATA_ROOT / "**" / "*.png"), recursive=True) + \
            glob.glob(str(DATA_ROOT / "**" / "*.jpeg"), recursive=True)
print(f"Total images found: {len(img_files)}")

# ─────────────────────────────────────────────────────────────────────
# STEP 3 — Explore & Organise Dataset
# ─────────────────────────────────────────────────────────────────────
import pandas as pd
import matplotlib.pyplot as plt

# Show directory tree
for p in sorted(DATA_ROOT.glob("**/*"))[:30]:
    print(p)

# Auto-detect class folders
class_dirs = [d for d in DATA_ROOT.rglob("*") if d.is_dir()]
print("\nDetected sub-directories:")
for d in class_dirs:
    count = len(list(d.glob("*.*")))
    print(f"  {d.name}: {count} images")

# ─────────────────────────────────────────────────────────────────────
# STEP 4 — Data Generators with Augmentation
# ─────────────────────────────────────────────────────────────────────
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

IMG_SIZE   = 224
BATCH_SIZE = 32
EPOCHS_WARMUP = 5    # Train only top layers
EPOCHS_FINETUNE = 15 # Fine-tune entire network

# Adjust to your actual dataset root that contains class sub-folders
# e.g., DATA_ROOT/healthy/ and DATA_ROOT/caries/
# If the structure is different, update TRAIN_DIR accordingly
TRAIN_DIR = DATA_ROOT  # Update this if dataset has train/ subfolder

train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    validation_split=0.2,
    rotation_range=20,
    width_shift_range=0.1,
    height_shift_range=0.1,
    shear_range=0.1,
    zoom_range=0.2,
    horizontal_flip=True,
    brightness_range=[0.8, 1.2],
    fill_mode="nearest"
)

val_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    validation_split=0.2
)

train_gen = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="training",
    shuffle=True
)

val_gen = val_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="validation",
    shuffle=False
)

NUM_CLASSES = train_gen.num_classes
CLASS_NAMES = list(train_gen.class_indices.keys())
print(f"\nClasses ({NUM_CLASSES}): {CLASS_NAMES}")
print(f"Training samples  : {train_gen.samples}")
print(f"Validation samples: {val_gen.samples}")

# ─────────────────────────────────────────────────────────────────────
# STEP 5 — Visualise Sample Images
# ─────────────────────────────────────────────────────────────────────
imgs, labels = next(train_gen)
fig, axes = plt.subplots(2, 4, figsize=(14, 7))
for i, ax in enumerate(axes.flat):
    ax.imshow(imgs[i])
    ax.set_title(CLASS_NAMES[labels[i].argmax()])
    ax.axis("off")
plt.suptitle("Sample Training Images — Caries Detection", fontsize=14)
plt.tight_layout()
plt.savefig("/content/sample_images_caries.png", dpi=100)
plt.show()

# ─────────────────────────────────────────────────────────────────────
# STEP 6 — Build EfficientNetB0 Transfer Learning Model
# ─────────────────────────────────────────────────────────────────────
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras import layers, Model, optimizers, callbacks

base_model = EfficientNetB0(
    weights="imagenet",
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)

# Phase 1: Freeze base — train only classifier head
base_model.trainable = False

inputs  = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
x       = base_model(inputs, training=False)
x       = layers.GlobalAveragePooling2D()(x)
x       = layers.BatchNormalization()(x)
x       = layers.Dropout(0.3)(x)
x       = layers.Dense(256, activation="relu",
                        kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
x       = layers.Dropout(0.2)(x)
outputs = layers.Dense(NUM_CLASSES, activation="softmax", name="caries_output")(x)

model = Model(inputs, outputs, name="caries_efficientnetb0")

model.compile(
    optimizer=optimizers.Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy",
             tf.keras.metrics.AUC(name="auc"),
             tf.keras.metrics.Precision(name="precision"),
             tf.keras.metrics.Recall(name="recall")]
)

model.summary()

# ─────────────────────────────────────────────────────────────────────
# STEP 7 — Phase 1: Warm-up Training (Head Only)
# ─────────────────────────────────────────────────────────────────────
OUTPUT_DIR = Path("/content/caries_output")
OUTPUT_DIR.mkdir(exist_ok=True)

cbs = [
    callbacks.ModelCheckpoint(
        str(OUTPUT_DIR / "best_caries_warmup.h5"),
        monitor="val_accuracy", save_best_only=True, verbose=1
    ),
    callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
    callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, verbose=1),
    callbacks.TensorBoard(log_dir=str(OUTPUT_DIR / "logs_warmup")),
]

print("\n" + "=" * 50)
print("  Phase 1: Warm-up Training (frozen base)")
print("=" * 50)

history_warmup = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_WARMUP,
    callbacks=cbs
)

# ─────────────────────────────────────────────────────────────────────
# STEP 8 — Phase 2: Fine-tuning (unfreeze all layers)
# ─────────────────────────────────────────────────────────────────────
# Unfreeze top 30 layers of EfficientNetB0
base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=optimizers.Adam(learning_rate=1e-5),   # Much lower LR
    loss="categorical_crossentropy",
    metrics=["accuracy",
             tf.keras.metrics.AUC(name="auc"),
             tf.keras.metrics.Precision(name="precision"),
             tf.keras.metrics.Recall(name="recall")]
)

cbs_ft = [
    callbacks.ModelCheckpoint(
        str(OUTPUT_DIR / "best_caries_finetune.h5"),
        monitor="val_accuracy", save_best_only=True, verbose=1
    ),
    callbacks.EarlyStopping(monitor="val_loss", patience=7, restore_best_weights=True),
    callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=3, verbose=1),
    callbacks.TensorBoard(log_dir=str(OUTPUT_DIR / "logs_finetune")),
]

print("\n" + "=" * 50)
print("  Phase 2: Fine-tuning (top 30 layers unfrozen)")
print("=" * 50)

history_ft = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_FINETUNE,
    callbacks=cbs_ft
)

# ─────────────────────────────────────────────────────────────────────
# STEP 9 — Evaluation & Confusion Matrix
# ─────────────────────────────────────────────────────────────────────
import numpy as np
import seaborn as sns
from sklearn.metrics import (classification_report, confusion_matrix,
                             roc_auc_score, roc_curve)

# Load best model
best_model = tf.keras.models.load_model(str(OUTPUT_DIR / "best_caries_finetune.h5"))

# Predict on validation set
val_gen.reset()
y_true = val_gen.classes
y_pred_probs = best_model.predict(val_gen, verbose=1)
y_pred = np.argmax(y_pred_probs, axis=1)

# Classification report
print("\nClassification Report:")
print(classification_report(y_true, y_pred, target_names=CLASS_NAMES))

# Confusion Matrix
cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES)
plt.title("Confusion Matrix — Caries Detection", fontsize=14)
plt.ylabel("True Label"); plt.xlabel("Predicted Label")
plt.tight_layout()
plt.savefig(str(OUTPUT_DIR / "confusion_matrix_caries.png"), dpi=100)
plt.show()

# Training history plot
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
all_acc = history_warmup.history["accuracy"] + history_ft.history["accuracy"]
all_val = history_warmup.history["val_accuracy"] + history_ft.history["val_accuracy"]
all_loss = history_warmup.history["loss"] + history_ft.history["loss"]
all_val_loss = history_warmup.history["val_loss"] + history_ft.history["val_loss"]

axes[0].plot(all_acc, label="Train Acc")
axes[0].plot(all_val, label="Val Acc")
axes[0].axvline(EPOCHS_WARMUP, color="r", linestyle="--", label="Fine-tune start")
axes[0].set_title("Accuracy"); axes[0].legend()

axes[1].plot(all_loss, label="Train Loss")
axes[1].plot(all_val_loss, label="Val Loss")
axes[1].axvline(EPOCHS_WARMUP, color="r", linestyle="--", label="Fine-tune start")
axes[1].set_title("Loss"); axes[1].legend()

plt.suptitle("Caries Detection — Training History", fontsize=14)
plt.tight_layout()
plt.savefig(str(OUTPUT_DIR / "training_history_caries.png"), dpi=100)
plt.show()

# ─────────────────────────────────────────────────────────────────────
# STEP 10 — Grad-CAM Visualisation
# ─────────────────────────────────────────────────────────────────────
import cv2

def make_gradcam(model, img_array, last_conv_layer="top_activation"):
    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer(last_conv_layer).output, model.output]
    )
    with tf.GradientTape() as tape:
        conv_out, preds = grad_model(img_array)
        pred_idx = tf.argmax(preds[0])
        class_channel = preds[:, pred_idx]

    grads = tape.gradient(class_channel, conv_out)
    pooled = tf.reduce_mean(grads, axis=(0, 1, 2))
    cam = conv_out[0] @ pooled[..., tf.newaxis]
    cam = tf.squeeze(cam)
    cam = tf.maximum(cam, 0) / tf.math.reduce_max(cam)
    return cam.numpy(), int(pred_idx)

# Find last conv layer
last_conv = None
for layer in reversed(best_model.layers):
    if "conv" in layer.name.lower() or "activation" in layer.name.lower():
        last_conv = layer.name
        break

print(f"Using layer for Grad-CAM: {last_conv}")

# Visualise Grad-CAM on a validation batch
sample_imgs, sample_labels = next(val_gen)
fig, axes = plt.subplots(2, 4, figsize=(16, 8))
for i in range(min(4, len(sample_imgs))):
    orig_img = sample_imgs[i]
    inp = np.expand_dims(orig_img, axis=0)
    try:
        cam, pred_idx = make_gradcam(best_model, inp, last_conv)
        cam_resized = cv2.resize(cam, (IMG_SIZE, IMG_SIZE))
        cam_uint8 = np.uint8(255 * cam_resized)
        cam_color = cv2.applyColorMap(cam_uint8, cv2.COLORMAP_JET)
        cam_rgb = cv2.cvtColor(cam_color, cv2.COLOR_BGR2RGB)
        overlay = (0.6 * (orig_img * 255) + 0.4 * cam_rgb).astype(np.uint8)

        axes[0][i].imshow(orig_img)
        axes[0][i].set_title(f"True: {CLASS_NAMES[sample_labels[i].argmax()]}")
        axes[0][i].axis("off")

        axes[1][i].imshow(overlay)
        axes[1][i].set_title(f"Grad-CAM → {CLASS_NAMES[pred_idx]}")
        axes[1][i].axis("off")
    except Exception as e:
        print(f"Grad-CAM failed for sample {i}: {e}")

plt.suptitle("Grad-CAM Visualisation — Caries Detection", fontsize=14)
plt.tight_layout()
plt.savefig(str(OUTPUT_DIR / "gradcam_caries.png"), dpi=100)
plt.show()

# ─────────────────────────────────────────────────────────────────────
# STEP 11 — Save Final Production Model
# ─────────────────────────────────────────────────────────────────────
FINAL_PATH = OUTPUT_DIR / "caries_model.h5"
best_model.save(str(FINAL_PATH))
size_mb = FINAL_PATH.stat().st_size / (1024 * 1024)
print(f"\n✅ Final model saved: {FINAL_PATH}  ({size_mb:.1f} MB)")
print("   → Copy this file to:  DentalPro/backend/models/caries_model.h5")

# Download in Colab
try:
    from google.colab import files
    files.download(str(FINAL_PATH))
    print("📥 Download triggered!")
except ImportError:
    print("   Not in Colab — copy file manually.")
