import cv2
import numpy as np
from pathlib import Path

def debug_image(img_path):
    img = cv2.imread(str(img_path))
    if img is None:
        return "Failed to load"
    h, w, c = img.shape
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Calculate average brightness
    avg_brightness = np.mean(gray)
    
    # Print threshold values
    _, thresh = cv2.threshold(gray, 20, 255, cv2.THRESH_BINARY)
    non_zero_ratio = np.sum(thresh > 0) / (h * w)
    
    # Find active boundary
    # Let's inspect where pixels are non-zero
    y_coords, x_coords = np.where(gray > 20)
    if len(x_coords) == 0:
        return f"All zero, shape={h}x{w}"
        
    min_x, max_x = np.min(x_coords), np.max(x_coords)
    min_y, max_y = np.min(y_coords), np.max(y_coords)
    
    return f"Shape: {w}x{h} | Avg Brightness: {avg_brightness:.1f} | Non-zero ratio (thresh 20): {non_zero_ratio:.2%} | bounding box of active pixels: X:[{min_x}-{max_x}], Y:[{min_y}-{max_y}]"

def main():
    DATA = Path(r'c:\Users\HP\OneDrive\Desktop\DentalPro\datasets')
    
    classes = ['Concave', 'Convex', 'Plane']
    for cls in classes:
        folder = DATA / 'orthodontics' / 'Cephalometric Profile Dataset' / cls
        if folder.exists():
            imgs = list(folder.glob('*.*'))[:2]
            print(f"Class: {cls}")
            for img in imgs:
                res = debug_image(img)
                print(f"  {img.name}: {res}")

if __name__ == '__main__':
    main()
