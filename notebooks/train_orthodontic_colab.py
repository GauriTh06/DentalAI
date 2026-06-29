# ╔══════════════════════════════════════════════════════════════════╗
# ║        DentalAI Pro — Orthodontic Analysis Training Script      ║
# ║        Model: ResNet50 (Transfer Learning)                      ║
# ║        Dataset: Cephalometric / Orthodontic X-Ray Dataset       ║
# ║        Target: backend/models/orthodontic_model.h5              ║
# ║                                                                  ║
# ║  INSTRUCTIONS:                                                   ║
# ║  1. Upload to Google Colab / Kaggle Notebooks                   ║
# ║  2. Enable GPU: Runtime > Change Runtime Type > GPU             ║
# ║  3. Set Kaggle credentials (Step 1)                             ║
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
install("albumentations")

# ─────────────────────────────────────────────────────────────────────
# STEP 1 — Kaggle Authentication
# ─────────────────────────────────────────────────────────────────────
import os, json
from pathlib import Path

os.environ["KAGGLE_USERNAME"] = "YOUR_KAGGLE_USERNAME"   # ← Replace
os.environ["KAGGLE_KEY"]      = "YOUR_KAGGLE_API_KEY"    # ← Replace

kaggle_dir = Path.home() / ".kaggle"
kaggle_dir.mkdir(parents=True, exist_ok=True)
kaggle_json = kaggle_dir / "kaggle.json"

if not kaggle_json.exists():
    with open(kaggle_json, "w") as f:
        json.dump({
            "username": os.environ["KAGGLE_USERNAME"],
            "key":      os.environ["KAGGLE_KEY"]
        }, f)
    kaggle_json.chmod(0o600)
    print("✅ kaggle.json created")

# ─────────────────────────────────────────────────────────────────────
# STEP 2 — Download Dataset
# ─────────────────────────────────────────────────────────────────────
DATA_ROOT = Path("/content/dental_data/orthodontic")
DATA_ROOT.mkdir(parents=True, exist_ok=True)

# Primary dataset slug — Cephalometric Landmark Detection / Orthodontics
DATASET_SLUG = "awsaf49/cephalometric-landmark-detection"

print(f"Downloading: {DATASET_SLUG}")
os.system(f"kaggle datasets download -d {DATASET_SLUG} -p {DATA_ROOT} --unzip")

# Fallback: Teeth segmentation or classification dataset
fallback_slug = "humansintheloop/teeth-segmentation-oral-disease-detection"
import glob
img_files = (
    glob.glob(str(DATA_ROOT / "**" / "*.jpg"), recursive=True) +
    glob.glob(str(DATA_ROOT / "**" / "*.png"), recursive=True) +
    glob.glob(str(DATA_ROOT / "**" / "*.jpeg"), recursive=True)
)
if not img_files:
    print("Primary slug failed. Trying fallback ...")
    os.system(f"kaggle datasets download -d {fallback_slug} -p {DATA_ROOT} --unzip")

img_files = (
    glob.glob(str(DATA_ROOT / "**" / "*.jpg"), recursive=True) +
    glob.glob(str(DATA_ROOT / "**" / "*.png"), recursive=True)
)
print(f"Total images found: {len(img_files)}")

# ─────────────────────────────────────────────────────────────────────
# STEP 3 — Dataset Structure Check
# ─────────────────────────────────────────────────────────────────────
for p in sorted(DATA_ROOT.glob("**/*"))[:30]:
    print(p)

class_dirs = [d for d in DATA_ROOT.rglob("*") if d.is_dir()]
for d in class_dirs:
    count = len(list(d.glob("*.*")))
    if count > 0:
        print(f"  {d.name}: {count} files")

# ─────────────────────────────────────────────────────────────────────
# STEP 4 — Data Generators
# ─────────────────────────────────────────────────────────────────────
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

IMG_SIZE      = 224
BATCH_SIZE    = 32
EPOCHS_WARMUP = 5
EPOCHS_FINE   = 15

# If dataset has class sub-folders, point TRAIN_DIR there
# Expected structure: orthodontic/normal/, orthodontic/overbite/, etc.
TRAIN_DIR = DATA_ROOT

CLASS_NAMES = ["Normal", "Overbite", "Underbite", "Crowding", "Spacing"]

train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    validation_split=0.2,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    shear_range=0.05,
    zoom_range=0.15,
    horizontal_flip=True,
    brightness_range=[0.85, 1.15],
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
ACTUAL_CLASSES = list(train_gen.class_indices.keys())
print(f"Classes ({NUM_CLASSES}): {ACTUAL_CLASSES}")
print(f"Training samples  : {train_gen.samples}")
print(f"Validation samples: {val_gen.samples}")

# ─────────────────────────────────────────────────────────────────────
# STEP 5 — Class Imbalance Handling
# ─────────────────────────────────────────────────────────────────────
from sklearn.utils.class_weight import compute_class_weight

y_train = train_gen.classes
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(y_train),
    y=y_train
)
class_weight_dict = dict(enumerate(class_weights))
print(f"\nClass weights: {class_weight_dict}")

# ─────────────────────────────────────────────────────────────────────
# STEP 6 — Build ResNet50 Model
# ─────────────────────────────────────────────────────────────────────
from tensorflow.keras.applications import ResNet50
from tensorflow.keras import layers, Model, optimizers, callbacks

base_model = ResNet50(
    weights="imagenet",
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)
base_model.trainable = False

inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
x = base_model(inputs, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.4)(x)
x = layers.Dense(512, activation="relu",
                  kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.3)(x)
x = layers.Dense(256, activation="relu")(x)
x = layers.Dropout(0.2)(x)
outputs = layers.Dense(NUM_CLASSES, activation="softmax", name="ortho_output")(x)

model = Model(inputs, outputs, name="orthodontic_resnet50")

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
# STEP 7 — Phase 1: Warm-up (frozen base)
# ─────────────────────────────────────────────────────────────────────
OUTPUT_DIR = Path("/content/orthodontic_output")
OUTPUT_DIR.mkdir(exist_ok=True)

cbs = [
    callbacks.ModelCheckpoint(
        str(OUTPUT_DIR / "best_ortho_warmup.h5"),
        monitor="val_accuracy", save_best_only=True, verbose=1
    ),
    callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
    callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, verbose=1),
    callbacks.TensorBoard(log_dir=str(OUTPUT_DIR / "logs_warmup")),
]

print("\n" + "=" * 50)
print("  Phase 1: Warm-up (frozen ResNet50 base)")
print("=" * 50)

history_warmup = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_WARMUP,
    class_weight=class_weight_dict,
    callbacks=cbs
)

# ─────────────────────────────────────────────────────────────────────
# STEP 8 — Phase 2: Fine-tuning ResNet50
# ─────────────────────────────────────────────────────────────────────
# Unfreeze from conv5_block1 onwards (last residual block)
base_model.trainable = True
unfreeze_from = "conv5_block1_0_conv"
trainable_flag = False

for layer in base_model.layers:
    if layer.name == unfreeze_from:
        trainable_flag = True
    layer.trainable = trainable_flag

model.compile(
    optimizer=optimizers.Adam(learning_rate=5e-6),
    loss="categorical_crossentropy",
    metrics=["accuracy",
             tf.keras.metrics.AUC(name="auc"),
             tf.keras.metrics.Precision(name="precision"),
             tf.keras.metrics.Recall(name="recall")]
)

cbs_ft = [
    callbacks.ModelCheckpoint(
        str(OUTPUT_DIR / "best_ortho_finetune.h5"),
        monitor="val_accuracy", save_best_only=True, verbose=1
    ),
    callbacks.EarlyStopping(monitor="val_loss", patience=7, restore_best_weights=True),
    callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=3, verbose=1),
    callbacks.TensorBoard(log_dir=str(OUTPUT_DIR / "logs_finetune")),
]

print("\n" + "=" * 50)
print("  Phase 2: Fine-tuning (ResNet50 conv5 block)")
print("=" * 50)

history_ft = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_FINE,
    class_weight=class_weight_dict,
    callbacks=cbs_ft
)

# ─────────────────────────────────────────────────────────────────────
# STEP 9 — Evaluation
# ─────────────────────────────────────────────────────────────────────
from sklearn.metrics import classification_report, confusion_matrix
import cv2

best_model = tf.keras.models.load_model(str(OUTPUT_DIR / "best_ortho_finetune.h5"))

val_gen.reset()
y_true = val_gen.classes
y_pred_probs = best_model.predict(val_gen, verbose=1)
y_pred = np.argmax(y_pred_probs, axis=1)

print("\nClassification Report:")
print(classification_report(y_true, y_pred, target_names=ACTUAL_CLASSES[:NUM_CLASSES]))

# Confusion Matrix
cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt="d", cmap="Greens",
            xticklabels=ACTUAL_CLASSES[:NUM_CLASSES],
            yticklabels=ACTUAL_CLASSES[:NUM_CLASSES])
plt.title("Confusion Matrix — Orthodontic Analysis", fontsize=14)
plt.ylabel("True Label"); plt.xlabel("Predicted Label")
plt.tight_layout()
plt.savefig(str(OUTPUT_DIR / "confusion_matrix_ortho.png"), dpi=100)
plt.show()

# Training history
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
plt.suptitle("Orthodontic Analysis — Training History")
plt.tight_layout()
plt.savefig(str(OUTPUT_DIR / "training_history_ortho.png"), dpi=100)
plt.show()

# ─────────────────────────────────────────────────────────────────────
# STEP 10 — Grad-CAM Visualisation
# ─────────────────────────────────────────────────────────────────────
def make_gradcam(model, img_array, last_conv_layer):
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

# Find last conv layer for ResNet50 (usually conv5_block3_out)
last_conv = None
for layer in reversed(best_model.layers):
    if isinstance(layer, tf.keras.layers.Conv2D):
        last_conv = layer.name
        break
print(f"Using layer for Grad-CAM: {last_conv}")

sample_imgs, sample_labels = next(val_gen)
fig, axes = plt.subplots(2, 4, figsize=(16, 8))
for i in range(min(4, len(sample_imgs))):
    inp = np.expand_dims(sample_imgs[i], axis=0)
    try:
        cam, pred_idx = make_gradcam(best_model, inp, last_conv)
        cam_resized = cv2.resize(cam, (IMG_SIZE, IMG_SIZE))
        cam_uint8 = np.uint8(255 * cam_resized)
        cam_color = cv2.applyColorMap(cam_uint8, cv2.COLORMAP_JET)
        cam_rgb = cv2.cvtColor(cam_color, cv2.COLOR_BGR2RGB)
        overlay = (0.6 * (sample_imgs[i] * 255) + 0.4 * cam_rgb).astype(np.uint8)
        axes[0][i].imshow(sample_imgs[i]); axes[0][i].axis("off")
        axes[0][i].set_title(f"True: {ACTUAL_CLASSES[sample_labels[i].argmax()]}")
        axes[1][i].imshow(overlay); axes[1][i].axis("off")
        axes[1][i].set_title(f"Pred: {ACTUAL_CLASSES[pred_idx]}")
    except Exception as e:
        print(f"Grad-CAM failed: {e}")
plt.suptitle("Grad-CAM — Orthodontic Analysis", fontsize=14)
plt.tight_layout()
plt.savefig(str(OUTPUT_DIR / "gradcam_ortho.png"), dpi=100)
plt.show()

# ─────────────────────────────────────────────────────────────────────
# STEP 11 — Save Final Model
# ─────────────────────────────────────────────────────────────────────
FINAL_PATH = OUTPUT_DIR / "orthodontic_model.h5"
best_model.save(str(FINAL_PATH))
size_mb = FINAL_PATH.stat().st_size / (1024 * 1024)
print(f"\n✅ Final model saved: {FINAL_PATH}  ({size_mb:.1f} MB)")
print("   → Copy to:  DentalPro/backend/models/orthodontic_model.h5")

try:
    from google.colab import files
    files.download(str(FINAL_PATH))
    print("📥 Download triggered!")
except ImportError:
    pass
