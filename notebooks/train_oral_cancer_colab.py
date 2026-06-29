# ╔══════════════════════════════════════════════════════════════════╗
# ║        DentalAI Pro — Oral Cancer Risk Training Script          ║
# ║        Model: DenseNet121 (Transfer Learning)                   ║
# ║        Dataset: Oral Cancer Dataset (Kaggle)                    ║
# ║        Target: backend/models/cancer_model.h5                   ║
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
DATA_ROOT = Path("/content/dental_data/oral_cancer")
DATA_ROOT.mkdir(parents=True, exist_ok=True)

# Primary: Oral Cancer Dataset
DATASET_SLUG = "zaidpy/oral-cancer-dataset"
print(f"Downloading: {DATASET_SLUG}")
os.system(f"kaggle datasets download -d {DATASET_SLUG} -p {DATA_ROOT} --unzip")

# Fallback
import glob
img_files = (
    glob.glob(str(DATA_ROOT / "**" / "*.jpg"), recursive=True) +
    glob.glob(str(DATA_ROOT / "**" / "*.png"), recursive=True) +
    glob.glob(str(DATA_ROOT / "**" / "*.jpeg"), recursive=True)
)

if not img_files:
    fallback_slug = "shivam17/oral-cancer-detection"
    print("Primary slug failed. Trying fallback ...")
    os.system(f"kaggle datasets download -d {fallback_slug} -p {DATA_ROOT} --unzip")

    # Second fallback
    img_files = glob.glob(str(DATA_ROOT / "**" / "*.jpg"), recursive=True)
    if not img_files:
        fallback2 = "ankitpathak527/oral-cancer-detection-dataset"
        print("Second fallback ...")
        os.system(f"kaggle datasets download -d {fallback2} -p {DATA_ROOT} --unzip")

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
EPOCHS_WARMUP = 8
EPOCHS_FINE   = 20

TRAIN_DIR = DATA_ROOT

# Strong augmentation for small medical image datasets
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    validation_split=0.2,
    rotation_range=30,
    width_shift_range=0.15,
    height_shift_range=0.15,
    shear_range=0.1,
    zoom_range=0.2,
    horizontal_flip=True,
    vertical_flip=False,
    brightness_range=[0.7, 1.3],
    channel_shift_range=20,
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
print(f"Classes ({NUM_CLASSES}): {CLASS_NAMES}")
print(f"Training samples  : {train_gen.samples}")
print(f"Validation samples: {val_gen.samples}")

# ─────────────────────────────────────────────────────────────────────
# STEP 5 — Focal Loss (handles severe class imbalance)
# ─────────────────────────────────────────────────────────────────────
from sklearn.utils.class_weight import compute_class_weight

y_train = train_gen.classes
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(y_train),
    y=y_train
)
class_weight_dict = dict(enumerate(class_weights))
print(f"Class weights: {class_weight_dict}")

# Custom focal loss function
def focal_loss(gamma=2.0, alpha=0.25):
    """Focal Loss for severe class imbalance (common in cancer datasets)"""
    def focal_loss_fn(y_true, y_pred):
        epsilon = tf.keras.backend.epsilon()
        y_pred = tf.clip_by_value(y_pred, epsilon, 1.0 - epsilon)
        ce = -y_true * tf.math.log(y_pred)
        weight = alpha * tf.pow(1 - y_pred, gamma)
        fl = weight * ce
        return tf.reduce_sum(fl, axis=-1)
    return focal_loss_fn

# ─────────────────────────────────────────────────────────────────────
# STEP 6 — Build DenseNet121 Model
# ─────────────────────────────────────────────────────────────────────
from tensorflow.keras.applications import DenseNet121
from tensorflow.keras import layers, Model, optimizers, callbacks

base_model = DenseNet121(
    weights="imagenet",
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)
base_model.trainable = False

inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
x = base_model(inputs, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.5)(x)
x = layers.Dense(512, activation="relu",
                  kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.4)(x)
x = layers.Dense(256, activation="relu",
                  kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
x = layers.Dropout(0.3)(x)
x = layers.Dense(128, activation="relu")(x)
x = layers.Dropout(0.2)(x)
outputs = layers.Dense(NUM_CLASSES, activation="softmax", name="cancer_output")(x)

model = Model(inputs, outputs, name="cancer_densenet121")

model.compile(
    optimizer=optimizers.Adam(learning_rate=1e-3),
    loss=focal_loss(gamma=2.0, alpha=0.25),
    metrics=["accuracy",
             tf.keras.metrics.AUC(name="auc"),
             tf.keras.metrics.Precision(name="precision"),
             tf.keras.metrics.Recall(name="recall")]
)

model.summary()

# ─────────────────────────────────────────────────────────────────────
# STEP 7 — Phase 1: Warm-up Training
# ─────────────────────────────────────────────────────────────────────
OUTPUT_DIR = Path("/content/cancer_output")
OUTPUT_DIR.mkdir(exist_ok=True)

cbs = [
    callbacks.ModelCheckpoint(
        str(OUTPUT_DIR / "best_cancer_warmup.h5"),
        monitor="val_auc", save_best_only=True, mode="max", verbose=1
    ),
    callbacks.EarlyStopping(
        monitor="val_auc", patience=6, restore_best_weights=True, mode="max"
    ),
    callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, verbose=1),
    callbacks.TensorBoard(log_dir=str(OUTPUT_DIR / "logs_warmup")),
]

print("\n" + "=" * 50)
print("  Phase 1: Warm-up (frozen DenseNet121 base)")
print("=" * 50)

history_warmup = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_WARMUP,
    class_weight=class_weight_dict,
    callbacks=cbs
)

# ─────────────────────────────────────────────────────────────────────
# STEP 8 — Phase 2: Fine-tuning
# ─────────────────────────────────────────────────────────────────────
# Unfreeze top Dense block (last ~60 layers of DenseNet121)
base_model.trainable = True
for layer in base_model.layers[:-60]:
    layer.trainable = False

model.compile(
    optimizer=optimizers.Adam(learning_rate=5e-6),
    loss=focal_loss(gamma=2.0, alpha=0.25),
    metrics=["accuracy",
             tf.keras.metrics.AUC(name="auc"),
             tf.keras.metrics.Precision(name="precision"),
             tf.keras.metrics.Recall(name="recall")]
)

cbs_ft = [
    callbacks.ModelCheckpoint(
        str(OUTPUT_DIR / "best_cancer_finetune.h5"),
        monitor="val_auc", save_best_only=True, mode="max", verbose=1
    ),
    callbacks.EarlyStopping(
        monitor="val_auc", patience=8, restore_best_weights=True, mode="max"
    ),
    callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=4, verbose=1),
    callbacks.TensorBoard(log_dir=str(OUTPUT_DIR / "logs_finetune")),
]

print("\n" + "=" * 50)
print("  Phase 2: Fine-tuning (last 60 layers of DenseNet121)")
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
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc
import cv2

best_model = tf.keras.models.load_model(
    str(OUTPUT_DIR / "best_cancer_finetune.h5"),
    custom_objects={"focal_loss_fn": focal_loss()}
)

val_gen.reset()
y_true = val_gen.classes
y_pred_probs = best_model.predict(val_gen, verbose=1)
y_pred = np.argmax(y_pred_probs, axis=1)

print("\nClassification Report:")
print(classification_report(y_true, y_pred, target_names=CLASS_NAMES))

# Confusion Matrix
cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt="d", cmap="Reds",
            xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES)
plt.title("Confusion Matrix — Oral Cancer Risk", fontsize=14)
plt.ylabel("True"); plt.xlabel("Predicted")
plt.tight_layout()
plt.savefig(str(OUTPUT_DIR / "confusion_matrix_cancer.png"), dpi=100)
plt.show()

# ROC Curves per class
from sklearn.preprocessing import label_binarize
y_bin = label_binarize(y_true, classes=list(range(NUM_CLASSES)))
if NUM_CLASSES == 2:
    y_bin = np.hstack([1 - y_bin, y_bin])

plt.figure(figsize=(8, 6))
for i, cls in enumerate(CLASS_NAMES):
    if i < y_pred_probs.shape[1]:
        fpr, tpr, _ = roc_curve(y_bin[:, i], y_pred_probs[:, i])
        roc_auc = auc(fpr, tpr)
        plt.plot(fpr, tpr, label=f"{cls} (AUC = {roc_auc:.3f})")
plt.plot([0, 1], [0, 1], "k--")
plt.xlabel("False Positive Rate"); plt.ylabel("True Positive Rate")
plt.title("ROC Curves — Oral Cancer Risk")
plt.legend(); plt.tight_layout()
plt.savefig(str(OUTPUT_DIR / "roc_curves_cancer.png"), dpi=100)
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
plt.suptitle("Oral Cancer Risk — Training History")
plt.tight_layout()
plt.savefig(str(OUTPUT_DIR / "training_history_cancer.png"), dpi=100)
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

# DenseNet121 last conv layer (usually relu in last dense block)
last_conv = None
for layer in reversed(best_model.layers):
    if isinstance(layer, tf.keras.layers.Conv2D):
        last_conv = layer.name
        break
print(f"Grad-CAM layer: {last_conv}")

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
        axes[0][i].set_title(f"True: {CLASS_NAMES[sample_labels[i].argmax()]}")
        axes[1][i].imshow(overlay); axes[1][i].axis("off")
        axes[1][i].set_title(f"Pred: {CLASS_NAMES[pred_idx]}")
    except Exception as e:
        print(f"Grad-CAM error: {e}")
plt.suptitle("Grad-CAM — Oral Cancer Risk", fontsize=14)
plt.tight_layout()
plt.savefig(str(OUTPUT_DIR / "gradcam_cancer.png"), dpi=100)
plt.show()

# ─────────────────────────────────────────────────────────────────────
# STEP 11 — Save Final Production Model
# ─────────────────────────────────────────────────────────────────────
FINAL_PATH = OUTPUT_DIR / "cancer_model.h5"
best_model.save(str(FINAL_PATH))
size_mb = FINAL_PATH.stat().st_size / (1024 * 1024)
print(f"\n✅ Final model saved: {FINAL_PATH}  ({size_mb:.1f} MB)")
print("   → Copy to:  DentalPro/backend/models/cancer_model.h5")

try:
    from google.colab import files
    files.download(str(FINAL_PATH))
    print("📥 Download triggered!")
except ImportError:
    pass
