import os
import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)
import cv2
import sys
import json


def clahe_image(img, settings):
    settings_clipLimit = float(settings[0]["sub_settings"][0]["value"])
    settings_tileGridSize = int(settings[0]["sub_settings"][1]["value"])

    clahe = cv2.createCLAHE(clipLimit= settings_clipLimit, tileGridSize=(settings_tileGridSize, settings_tileGridSize))

    img_lab = cv2.cvtColor(img, cv2.COLOR_BGR2Lab)

    l, a, b = cv2.split(img_lab)
    img_l = clahe.apply(l)
    img_clahe = cv2.merge((img_l, a, b))

    img_clahe = cv2.cvtColor(img_clahe, cv2.COLOR_Lab2BGR)

    return img_clahe

def awb(img, settings):
    settings_p = float(settings[1]["sub_settings"][0]["value"])
    settings_saturationThreshold = float(settings[1]["sub_settings"][1]["value"])
    settings_saturationThreshold2 = float(settings[1]["sub_settings"][2]["value"])

    wb = cv2.xphoto.createSimpleWB()
    wb.setP(settings_p)
    
    img_wb = wb.balanceWhite(img)
    
    wb2 = cv2.xphoto.createGrayworldWB()
    wb2.setSaturationThreshold(settings_saturationThreshold)

    img_wb2 = wb2.balanceWhite(img_wb)

    wb3 = cv2.xphoto.createLearningBasedWB()
    wb3.setSaturationThreshold(settings_saturationThreshold2)

    img_wb3 = wb2.balanceWhite(img_wb2)

    return img_wb3

json_str = ''.join(sys.argv[1:])

json_settings = json.loads(json_str)

print(json_settings[1]["sub_settings"])


#print('Second param:'+sys.argv[1]+'#')

img = cv2.imread("./photos/foto.jpeg", cv2.IMREAD_COLOR) ## diğer dosya türleri için

img = clahe_image(img, json_settings)
img = awb(img, json_settings)

cv2.imwrite("./photos/foto_2.jpeg", img)
