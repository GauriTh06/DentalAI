import cv2
import numpy as np
from pathlib import Path

def test_oral_cancer_cv(img_path):
    img_cv = cv2.imread(str(img_path))
    if img_cv is None:
        return "Failed to load"
    h, w = img_cv.shape[:2]
    total_area = w * h
    hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
    
    # White/Mucosal patches: very high brightness, low saturation
    lower_white = np.array([0, 0, 215])
    upper_white = np.array([180, 45, 255])
    mask_white = cv2.inRange(hsv, lower_white, upper_white)
    
    # Red/Inflamed patches: very high saturation (cherry red), medium value
    lower_red1 = np.array([0, 115, 70])
    upper_red1 = np.array([8, 255, 255])
    lower_red2 = np.array([172, 115, 70])
    upper_red2 = np.array([180, 255, 255])
    mask_red1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask_red2 = cv2.inRange(hsv, lower_red2, upper_red2)
    mask_red = cv2.bitwise_or(mask_red1, mask_red2)
    
    # Combine both lesion filters
    lesion_mask = cv2.bitwise_or(mask_red, mask_white)
    
    # Focus primarily on center mouth area
    mouth_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.rectangle(mouth_mask, (int(w*0.25), int(h*0.25)), (int(w*0.75), int(h*0.75)), 255, -1)
    lesion_mask = cv2.bitwise_and(lesion_mask, mouth_mask)
    
    # Morph close to unify small spots
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    lesion_mask = cv2.morphologyEx(lesion_mask, cv2.MORPH_CLOSE, kernel)
    
    contours, _ = cv2.findContours(lesion_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    spots = []
    for c in contours:
        area = cv2.contourArea(c)
        # Spot area relative constraints
        if 15 < area < (0.08 * total_area):
            x_c, y_c, w_c, h_c = cv2.boundingRect(c)
            spots.append((x_c + w_c // 2, y_c + h_c // 2, area))
            
    print(f"Image: {Path(img_path).name} | Spots found: {len(spots)} | Max area: {max(s[2] for s in spots) if spots else 0}")

def main():
    DATA = Path(r'c:\Users\HP\OneDrive\Desktop\DentalPro\datasets')
    
    print("--- NORMAL SAMPLES ---")
    normal_folder = DATA / 'oral_cancer' / 'dataset' / 'normal'
    if normal_folder.exists():
        imgs = list(normal_folder.glob('*.*'))[:5]
        for img in imgs:
            test_oral_cancer_cv(img)
            
    print("\n--- CANCER SAMPLES ---")
    cancer_folder = DATA / 'oral_cancer' / 'dataset' / 'Oral Cancer photos'
    if cancer_folder.exists():
        imgs = list(cancer_folder.glob('*.*'))[:5]
        for img in imgs:
            test_oral_cancer_cv(img)

if __name__ == '__main__':
    main()
