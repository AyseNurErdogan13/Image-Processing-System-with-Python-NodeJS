import os
import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)
import cv2
import sys

def clahe_image(img):
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(32, 32))

    img_lab = cv2.cvtColor(img, cv2.COLOR_BGR2Lab)

    l, a, b = cv2.split(img_lab)
    img_l = clahe.apply(l)
    img_clahe = cv2.merge((img_l, a, b))

    img_clahe = cv2.cvtColor(img_clahe, cv2.COLOR_Lab2BGR)

    return img_clahe

def awb(img):
    wb = cv2.xphoto.createSimpleWB()
    wb.setP(0.4)
    
    img_wb = wb.balanceWhite(img)
    
    wb2 = cv2.xphoto.createGrayworldWB()
    wb2.setSaturationThreshold(0.90)

    img_wb2 = wb2.balanceWhite(img_wb)

    wb3 = cv2.xphoto.createLearningBasedWB()
    wb3.setSaturationThreshold(0.99)

    img_wb3 = wb2.balanceWhite(img_wb2)

    return img_wb3

#print('First param:'+sys.argv[1]+'#')
#print('Second param:'+sys.argv[2]+'#')

img = cv2.imread("./photos/foto.jpg", cv2.IMREAD_COLOR) ## diğer dosya türleri için

img = clahe_image(img)
img = awb(img)

cv2.imwrite("./photos/foto_2.jpg", img)
