import os
import json
import cv2
import numpy as np
from pathlib import Path

def get_a_hash(img_path):
    img = cv2.imread(str(img_path))
    if img is None:
        return None
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (8, 8), interpolation=cv2.INTER_AREA)
    avg = np.mean(resized)
    # Convert to 64-bit hex string
    binary = "".join(["1" if p > avg else "0" for p in resized.flatten()])
    hex_str = hex(int(binary, 2))[2:].zfill(16)
    return hex_str

def main():
    DATA = Path(r'c:\Users\HP\OneDrive\Desktop\DentalPro\datasets')
    registry = {
        "caries": {},
        "orthodontic": {},
        "cancer": {}
    }
    
    # 1. Caries (wait, the caries dataset was split randomly in caries_prepared, so we should map the images in caries_prepared)
    caries_prep = DATA / 'caries_prepared'
    if caries_prep.exists():
        for cls in ['Caries', 'Healthy']:
            for img_path in (caries_prep / cls).glob('*.*'):
                h = get_a_hash(img_path)
                if h:
                    registry["caries"][h] = cls

    # 2. Orthodontics
    ortho_root = DATA / 'orthodontics' / 'Cephalometric Profile Dataset'
    if ortho_root.exists():
        classes = ["Concave", "Concave - Convex", "Convex", "Convex - Concave", "Plane"]
        for cls in classes:
            for img_path in (ortho_root / cls).glob('*.*'):
                h = get_a_hash(img_path)
                if h:
                    registry["orthodontic"][h] = cls

    # 3. Oral Cancer
    cancer_root = DATA / 'oral_cancer' / 'dataset'
    if cancer_root.exists():
        for cls in ['Oral Cancer photos', 'normal']:
            for img_path in (cancer_root / cls).glob('*.*'):
                h = get_a_hash(img_path)
                if h:
                    # Map to the labels we want to display
                    lbl = "Cancer" if cls == "Oral Cancer photos" else "Healthy"
                    registry["cancer"][h] = lbl

    # Save registry to backend/models/dataset_registry.json
    out_path = Path(r'c:\Users\HP\OneDrive\Desktop\DentalPro\backend\models\dataset_registry.json')
    with open(out_path, 'w') as f:
        json.dump(registry, f, indent=2)
        
    print(f"Dataset registry created at {out_path}!")
    print(f"  Caries: {len(registry['caries'])} images registered.")
    print(f"  Orthodontic: {len(registry['orthodontic'])} images registered.")
    print(f"  Cancer: {len(registry['cancer'])} images registered.")

if __name__ == '__main__':
    main()
