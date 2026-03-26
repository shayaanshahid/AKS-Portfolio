from PIL import Image

def process_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    min_x, min_y = img.width, img.height
    max_x, max_y = 0, 0
    
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = datas[y * img.width + x]
            intensity = (r + g + b) // 3
            alpha = max(0, 255 - intensity)
            
            if alpha > 128:
                alpha = min(255, int((alpha - 128) * 2) + 128)
            else:
                alpha = int(alpha * 0.5)

            new_data.append((0, 0, 0, alpha))
            
            if alpha > 20:
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                
    img.putdata(new_data)
    
    if max_x >= min_x and max_y >= min_y:
        pad_x = int((max_x - min_x) * 0.05)
        pad_y = int((max_y - min_y) * 0.05)
        box = (max(0, min_x - pad_x), 
               max(0, min_y - pad_y), 
               min(img.width, max_x + pad_x), 
               min(img.height, max_y + pad_y))
        img = img.crop(box)
        
    img.save(output_path)

process_image('public/favicon.png', 'public/logo.png')
process_image('public/favicon.png', 'public/favicon.png')
print("Processed image successfully")
