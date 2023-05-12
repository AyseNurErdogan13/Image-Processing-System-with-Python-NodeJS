import os
import pandas as pd
import cv2

input_file_path = input("Girdi doysa yolu:")
output_file_path = input("Çıktı doysa yolu:")

#"./input" dizinindeki dosyaların listesi elde edilir 
print(os.listdir("./input"))

img_arr = os.listdir("./input")

for i in img_arr:
    if os.path.splitext(i)[1] == ".jpg":
        print("-------------")
        print(i)
        image_path = "/Users/aysenur/Desktop/aysi_goruntu" + os.path.join("/input", i)
        directory = r"/Users/aysenur/Desktop/aysi_goruntu/output/"
        
        ### bu arada resmi işledim
        img = cv2.imread(image_path, cv2.IMREAD_COLOR)

        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(16, 16))

        img_lab = cv2.cvtColor(img, cv2.COLOR_BGR2Lab)

        l, a, b = cv2.split(img_lab)
        img_l = clahe.apply(l)
        img_clahe = cv2.merge((img_l, a, b))

        img_clahe = cv2.cvtColor(img_clahe, cv2.COLOR_Lab2BGR)

        img = img_clahe

        ### KAYDETME

        os.chdir(directory)

        print("Before saving image:")
        print(os.listdir(directory))

        # dosya adı
        filename = i

        # görseli kaydetme
        cv2.imwrite(filename, img)

        print("After saving image:")
        print(os.listdir(directory))

        print("Successfully saved")
