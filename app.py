import os
import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)
import cv2
print(os.listdir("./input"))

# Image path
image_path = r"/Users/aysenur/Desktop/aysi_goruntu/input/1.jpg"

# Image directory
directory = r"/Users/aysenur/Desktop/aysi_goruntu/output/"

# Using cv2.imread() method
# to read the image
img = cv2.imread(image_path, cv2.IMREAD_COLOR)

### bu arada image yi işle

clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(16, 16))

img_lab = cv2.cvtColor(img, cv2.COLOR_BGR2Lab)

l, a, b = cv2.split(img_lab)
img_l = clahe.apply(l)
img_clahe = cv2.merge((img_l, a, b))

img_clahe = cv2.cvtColor(img_clahe, cv2.COLOR_Lab2BGR)

img = img_clahe

###

# Change the current directory
# to specified directory
os.chdir(directory)

# List files and directories
# in 'C:/Users/Rajnish/Desktop/GeeksforGeeks'
print("Before saving image:")
print(os.listdir(directory))

# Filename
filename = 'savedImage.jpg'

# Using cv2.imwrite() method
# Saving the image
cv2.imwrite(filename, img)

# List files and directories
# in 'C:/Users / Rajnish / Desktop / GeeksforGeeks'
print("After saving image:")
print(os.listdir(directory))

print('Successfully saved')
