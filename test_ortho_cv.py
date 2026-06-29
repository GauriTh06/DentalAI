import cv2
import numpy as np
from pathlib import Path

def analyze_ortho_profile(img_path):
    img = cv2.imread(str(img_path))
    if img is None:
        return "Failed to load"
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    # 1. Threshold to separate face from background
    # Cephalometric scans are bright on black background
    _, thresh = cv2.threshold(gray, 20, 255, cv2.THRESH_BINARY)
    
    # Clean up noise
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
    
    # 2. Extract profile edge (assuming facing right)
    # For each row, find the rightmost non-zero pixel
    profile_points = []
    # Analyze middle 60% of vertical range where the nose/mouth/chin are
    start_y, end_y = int(h * 0.2), int(h * 0.8)
    for y in range(start_y, end_y, 2):
        row = thresh[y, :]
        non_zeros = np.where(row > 0)[0]
        if len(non_zeros) > 0:
            rightmost_x = non_zeros[-1]
            profile_points.append((rightmost_x, y))
            
    if len(profile_points) < 20:
        return "Profile too short"
        
    profile_points = np.array(profile_points)
    xs = profile_points[:, 0]
    ys = profile_points[:, 1]
    
    # Smooth the curve
    xs_smooth = np.convolve(xs, np.ones(5)/5, mode='same')
    
    # 3. Find key landmarks:
    # Nose tip (pronaste): highest x value in the upper half of our profile range
    upper_half_len = len(xs_smooth) // 2
    nose_idx = np.argmax(xs_smooth[:upper_half_len])
    nose_x = xs_smooth[nose_idx]
    nose_y = ys[nose_idx]
    
    # Chin tip (pogonion): highest x value in the lower half of our profile range
    chin_idx = upper_half_len + np.argmax(xs_smooth[upper_half_len:])
    chin_x = xs_smooth[chin_idx]
    chin_y = ys[chin_idx]
    
    # Subnasale/Mouth indent: lowest x value between nose and chin
    indent_idx = nose_idx + np.argmin(xs_smooth[nose_idx:chin_idx])
    indent_x = xs_smooth[indent_idx]
    indent_y = ys[indent_idx]
    
    # Glabella (forehead): top of our range
    forehead_x = xs_smooth[0]
    forehead_y = ys[0]
    
    # Calculate Angle of Convexity: Glabella -> Subnasale -> Pogonion
    # Or simply: relation of indent_x to a line between nose/forehead and chin
    # If the indent is deep, it is convex (Class II / overbite).
    # If the indent is shallow or sticks out, it is concave (Class III / underbite).
    # Let's project the indent onto the line connecting forehead and chin
    line_vec = np.array([chin_x - forehead_x, chin_y - forehead_y])
    point_vec = np.array([indent_x - forehead_x, indent_y - forehead_y])
    
    # Normal vector to line
    line_len = np.linalg.norm(line_vec)
    if line_len == 0:
        return "Zero line length"
    
    normal = np.array([-line_vec[1], line_vec[0]]) / line_len
    dist = np.dot(point_vec, normal)
    
    return {
        "forehead": (int(forehead_x), int(forehead_y)),
        "nose": (int(nose_x), int(nose_y)),
        "indent": (int(indent_x), int(indent_y)),
        "chin": (int(chin_x), int(chin_y)),
        "dist": dist
    }

def main():
    DATA = Path(r'c:\Users\HP\OneDrive\Desktop\DentalPro\datasets')
    print("Testing Orthodontic profile detection:")
    
    classes = ['Concave', 'Convex', 'Plane']
    for cls in classes:
        folder = DATA / 'orthodontics' / 'Cephalometric Profile Dataset' / cls
        if folder.exists():
            imgs = list(folder.glob('*.*'))[:3]
            print(f"\nClass: {cls}")
            for img in imgs:
                res = analyze_ortho_profile(img)
                if isinstance(res, dict):
                    print(f"  Image: {img.name} | Dist: {res['dist']:.1f}")
                else:
                    print(f"  Image: {img.name} | Error: {res}")

if __name__ == '__main__':
    main()
