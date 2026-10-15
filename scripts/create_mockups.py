import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

MOCKUPS_DIR = r"C:\Users\murat\.gemini\antigravity\scratch\red-app\assets\mockups"
SCREENSHOTS_DIR = r"C:\Users\murat\.gemini\antigravity\scratch\red-app\assets\screenshots"
ARTIFACTS_DIR = r"C:\Users\murat\.gemini\antigravity\brain\58dcdee3-033a-4d7e-8aad-b9d44b749995"

os.makedirs(MOCKUPS_DIR, exist_ok=True)

# Slide configurations
slides = [
    {
        "file": "screenshot_1.jpg",
        "badge": "RED DISCOVERY",
        "title": "SİNEMA DÜNYASI CEBİNDE",
        "subtitle": "En popüler film ve dizileri anında keşfet",
        "output": "mockup_1.png"
    },
    {
        "file": "screenshot_2.jpg",
        "badge": "HD FRAGMANLAR",
        "title": "RESMİ FRAGMANLARI İZLE",
        "subtitle": "Vizyondaki en yeni yapımların fragmanları",
        "output": "mockup_2.png"
    },
    {
        "file": "screenshot_3.jpg",
        "badge": "ZENGİN ARŞİV",
        "title": "KATEGORİLERİ FİLTRELE",
        "subtitle": "Aksiyon, korku, bilim kurgu ve daha fazlası",
        "output": "mockup_3.png"
    },
    {
        "file": "screenshot_4.jpg",
        "badge": "KİŞİSEL LİSTEN",
        "title": "FAVORİLERİNİ KAYDET",
        "subtitle": "İzlemek istediklerini listene ekle, kaçırma",
        "output": "mockup_4.png"
    }
]

W, H = 1080, 1920

# Fonts
font_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 52)
font_subtitle = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 28)
font_badge = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 20)

for idx, slide in enumerate(slides):
    # 1. Background with subtle dark-red vignette gradient
    canvas = Image.new("RGB", (W, H), (12, 12, 15))
    draw = ImageDraw.Draw(canvas)
    
    # Atmospheric red ambient glow in the center-top
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([W//2 - 450, 150, W//2 + 450, 950], fill=(229, 9, 20, 35))
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    canvas.paste(glow, (0, 0), glow)
    
    # 2. Text layout
    badge_text = slide["badge"]
    title_text = slide["title"]
    sub_text = slide["subtitle"]
    
    # Draw Badge
    badge_bbox = font_badge.getbbox(badge_text)
    bw = badge_bbox[2] - badge_bbox[0] + 32
    bh = badge_bbox[3] - badge_bbox[1] + 16
    bx = (W - bw) // 2
    by = 95
    
    # Badge background
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=14, fill=(35, 10, 14), outline=(229, 9, 20), width=2)
    # Badge text
    draw.text((bx + 16, by + 6), badge_text, font=font_badge, fill=(255, 60, 70))
    
    # Draw Title
    title_bbox = font_title.getbbox(title_text)
    tw = title_bbox[2] - title_bbox[0]
    draw.text(((W - tw) // 2, 175), title_text, font=font_title, fill=(255, 255, 255))
    
    # Draw Subtitle
    sub_bbox = font_subtitle.getbbox(sub_text)
    sw = sub_bbox[2] - sub_bbox[0]
    draw.text(((W - sw) // 2, 250), sub_text, font=font_subtitle, fill=(160, 160, 170))
    
    # 3. Phone Frame Design
    # Phone dimensions
    phone_w = 780
    phone_h = 1580
    phone_x = (W - phone_w) // 2
    phone_y = 350
    outer_radius = 60
    inner_margin = 14
    inner_radius = 48
    
    # Drop shadow
    shadow_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_img)
    shadow_draw.rounded_rectangle(
        [phone_x - 10, phone_y + 15, phone_x + phone_w + 10, phone_y + phone_h + 30],
        radius=outer_radius + 6,
        fill=(0, 0, 0, 190)
    )
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(35))
    canvas.paste(shadow_img, (0, 0), shadow_img)
    
    # Phone Body (outer bezel)
    phone_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(phone_layer)
    
    # Outer dark titanium rim
    p_draw.rounded_rectangle(
        [phone_x, phone_y, phone_x + phone_w, phone_y + phone_h],
        radius=outer_radius,
        fill=(28, 29, 34),
        outline=(65, 67, 78),
        width=3
    )
    
    # Inner border line for depth
    p_draw.rounded_rectangle(
        [phone_x + 4, phone_y + 4, phone_x + phone_w - 4, phone_y + phone_h - 4],
        radius=outer_radius - 4,
        outline=(15, 15, 18),
        width=2
    )
    
    # 4. Screenshot fit inside screen area
    screen_x = phone_x + inner_margin
    screen_y = phone_y + inner_margin
    screen_w = phone_w - 2 * inner_margin
    screen_h = phone_h - 2 * inner_margin
    
    raw_path = os.path.join(SCREENSHOTS_DIR, slide["file"])
    if os.path.exists(raw_path):
        raw_screen = Image.open(raw_path).convert("RGBA")
        # Resize to fit screen
        scaled_screen = raw_screen.resize((screen_w, screen_h), Image.Resampling.LANCZOS)
        
        # Screen rounded mask
        mask = Image.new("L", (screen_w, screen_h), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([0, 0, screen_w, screen_h], radius=inner_radius, fill=255)
        
        phone_layer.paste(scaled_screen, (screen_x, screen_y), mask)
        
    # Camera punch hole
    cam_x = W // 2
    cam_y = screen_y + 24
    cam_r = 11
    p_draw.ellipse([cam_x - cam_r, cam_y - cam_r, cam_x + cam_r, cam_y + cam_r], fill=(5, 5, 8), outline=(30, 30, 35), width=2)
    # Speaker slit
    p_draw.rounded_rectangle([cam_x - 30, phone_y + 6, cam_x + 30, phone_y + 9], radius=2, fill=(45, 45, 50))
    
    # Screen inner highlight sheen (subtle glass effect)
    sheen = Image.new("RGBA", (screen_w, screen_h), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(sheen)
    s_draw.line([(0, 0), (screen_w, screen_h // 2)], fill=(255, 255, 255, 12), width=3)
    phone_layer.paste(sheen, (screen_x, screen_y), mask)
    
    canvas.paste(phone_layer, (0, 0), phone_layer)
    
    # Save output
    out_path = os.path.join(MOCKUPS_DIR, slide["output"])
    canvas.save(out_path, "PNG", quality=95)
    
    # Also save to artifacts for easy preview
    art_path = os.path.join(ARTIFACTS_DIR, slide["output"])
    canvas.save(art_path, "PNG", quality=95)
    print(f"Generated: {slide['output']}")

print("All mockups generated successfully!")
