import os
import sys
from pathlib import Path
import numpy as np

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
from tensorflow.keras.models import load_model
from PIL import Image

MODELS = Path(r'c:\Users\HP\OneDrive\Desktop\DentalPro\backend\models')
DATA   = Path(r'c:\Users\HP\OneDrive\Desktop\DentalPro\datasets')

def predict(model, img_path):
    img = Image.open(img_path).convert('RGB').resize((224, 224))
    arr = np.expand_dims(np.array(img) / 255.0, axis=0)
    return model.predict(arr, verbose=0)[0]

def main():
    m_caries = load_model(str(MODELS / 'caries_model.h5'))
    m_ortho  = load_model(str(MODELS / 'orthodontic_model.h5'))
    
    print("CARIES DETAILS:")
    for cls in ['Caries', 'Healthy']:
        folder = DATA / 'caries_prepared' / cls
        imgs = list(folder.glob('*.*'))[:3]
        for img in imgs:
            p = predict(m_caries, img)
            print(f"  Path: {img.name} | Prediction: {p}")

    print("\nORTHODONTIC DETAILS:")
    cls_names = ['Concave', 'Concave - Convex', 'Convex', 'Convex - Concave', 'Plane']
    for cls in cls_names:
        folder = DATA / 'orthodontics' / 'Cephalometric Profile Dataset' / cls
        imgs = list(folder.glob('*.*'))[:2]
        for img in imgs:
            p = predict(m_ortho, img)
            print(f"  Class: {cls:<18} | Path: {img.name} | Prediction: {p}")

if __name__ == '__main__':
    main()
