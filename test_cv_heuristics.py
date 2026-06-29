import cv2
import numpy as np
from pathlib import Path
from PIL import Image

def analyze_caries(img_path):
    # Load image
    img = cv2.imread(str(img_path))
    if img is None:
        return "Failed to load"
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    # Crop to center region where teeth are likely to be
    center_y_start, center_y_end = int(h * 0.2), int(h * 0.8)
    center_x_start, center_x_end = int(w * 0.2), int(w * 0.8)
    center_roi = gray[center_y_start:center_y_end, center_x_start:center_x_end]
    
    # Find local minima/dark spots within the teeth structure (excluding black background)
    # Threshold to find teeth (which are bright white/gray in X-rays)
    _, teeth_mask = cv2.threshold(center_roi, 80, 255, cv2.THRESH_BINARY)
    
    # Invert to look at dark regions inside the teeth
    teeth_inv = cv2.bitwise_not(teeth_mask)
    
    # We want local dark spots (valleys of intensity) inside the teeth
    # Using morphological black hat to find dark spots on bright background
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    blackhat = cv2.morphologyEx(center_roi, cv2.MORPH_BLACKHAT, kernel)
    
    # Threshold the blackhat image to get potential cavity regions
    _, thresh = cv2.threshold(blackhat, 25, 255, cv2.THRESH_BINARY)
    
    # Mask with teeth mask to ensure we only look inside teeth, not background
    cavity_candidates = cv2.bitwise_and(thresh, teeth_mask)
    
    contours, _ = cv2.findContours(cavity_candidates, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    detected_spots = []
    for c in contours:
        area = cv2.contourArea(c)
        if 20 < area < 1000:  # filter by size
            # Get bounding rect
            x, y, w_c, h_c = cv2.boundingRect(c)
            # Convert back to original image coordinates
            orig_x = x + center_x_start
            orig_y = y + center_y_start
            detected_spots.append((orig_x + w_c//2, orig_y + h_c//2, area))
            
    return detected_spots

def main():
    DATA = Path(r'c:\Users\HP\OneDrive\Desktop\DentalPro\datasets')
    print("Testing Caries CV Heuristics:")
    
    # Test on some caries images
    caries_folder = DATA / 'caries_prepared' / 'Caries'
    if caries_folder.exists():
        imgs = list(caries_folder.glob('*.*'))[:5]
        for img in imgs:
            spots = analyze_caries(img)
            print(f"  Image: {img.name} | Detected dark spots: {len(spots)} | Spots: {spots[:3]}")

if __name__ == '__main__':
    main()
