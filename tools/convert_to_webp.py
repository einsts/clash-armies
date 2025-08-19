import os
import hashlib
from PIL import Image

# 配置
input_dir = '../source-assets/banners'     # 原始图片文件夹
output_dir = '../source-assets/banner'      # 输出文件夹
quality = 80               # webp 压缩质量 (0~100)

# 创建输出文件夹
os.makedirs(output_dir, exist_ok=True)

# 批量转换
for filename in os.listdir(input_dir):
    if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        input_path = os.path.join(input_dir, filename)
        # 保留原文件名，只改后缀为 .webp
        name, _ = os.path.splitext(filename)
        output_path = os.path.join(output_dir, name + '.webp')
        
        with Image.open(input_path) as img:
            img.save(output_path, 'WEBP', quality=quality)
        
        print(f'Converted: {filename} -> {os.path.basename(output_path)}')

print('All images converted!')