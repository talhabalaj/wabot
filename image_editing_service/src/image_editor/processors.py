import os
from .utils import fit_text
from PIL import Image, ImageDraw, ImageFont

font = ImageFont.truetype("/usr/share/fonts/TTF/DejaVuSans.ttf", size=50)

def grades_image_processsor(text1: str, text2: str):
  """
  This function is used to process the image.
  """
  box_1 = (436, 7, 800, 390)
  box_2 = (570, 526, 570 + 256, 526 + 321)
  box_3 = (6, 740, 6 + 300, 740 + 265)

  image = Image.open(os.path.join(os.path.dirname(__file__), '../../assets/grades.jpg'))
  image_draw = ImageDraw.Draw(image)

  fit_text(image_draw, box_1, text1, font)
  fit_text(image_draw, box_2, text1, font)
  fit_text(image_draw, box_3, text2, font)

  return image.tobytes()