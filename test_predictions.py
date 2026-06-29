import os
import sys
from pathlib import Path

# Suppress tensorflow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Add backend directory to python path
sys.path.insert(0, str(Path(r'c:\Users\HP\OneDrive\Desktop\DentalPro')))

from backend.app.services.ai_models import ai_models

DATA = Path(r'c:\Users\HP\OneDrive\Desktop\DentalPro\datasets')

def main():
    print("=" * 60)
    print("  Testing DentalAI Pro Backend Wrapper Prediction Outputs")
    print("=" * 60)
    
    # Check if models were loaded
    print(f"TensorFlow Active: {ai_models.caries_model is not None}")
    print("Running tests...\n")

    # --- CARIES ---
    print("=== CARIES (Hybrid CV + DL) ===")
    for cls in ['Caries', 'Healthy']:
        folder = DATA / 'caries_prepared' / cls
        try:
            img_file = next(folder.glob('*.*'))
            res = ai_models.predict_caries(str(img_file))
            print(f"  Actual: {cls:<8s} | Predicted: {res['label']:<15s} | Conf: {res['confidence']}% | Severity: {res['severity']}")
        except StopIteration:
            print(f"  No images in {folder}")

    # --- ORTHODONTIC ---
    print("\n=== ORTHODONTIC (Hybrid CV + DL) ===")
    cls_names = ['Concave', 'Concave - Convex', 'Convex', 'Convex - Concave', 'Plane']
    for cls in cls_names:
        folder = DATA / 'orthodontics' / 'Cephalometric Profile Dataset' / cls
        try:
            img_file = next(folder.glob('*.*'))
            res = ai_models.predict_orthodontic(str(img_file))
            print(f"  Actual: {cls:<18s} | Predicted: {res['label']:<25s} | Conf: {res['confidence']}% | Severity: {res['severity']}")
        except StopIteration:
            print(f"  No images in {folder}")

    # --- CANCER ---
    print("\n=== CANCER (Hybrid CV + DL) ===")
    for cls in ['Oral Cancer photos', 'normal']:
        folder = DATA / 'oral_cancer' / 'dataset' / cls
        try:
            img_file = next(folder.glob('*.*'))
            res = ai_models.predict_oral_cancer(str(img_file))
            print(f"  Actual: {cls:<18s} | Predicted: {res['label']:<25s} | Conf: {res['confidence']}% | Severity: {res['severity']}")
        except StopIteration:
            print(f"  No images in {folder}")

if __name__ == '__main__':
    main()
