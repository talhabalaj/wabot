from PIL import ImageDraw, ImageFont
import textwrap
from string import ascii_letters


def fit_text(
    draw: ImageDraw.ImageDraw,
    box: tuple[float, float, float, float],
    text: str,
    font: ImageFont,
    stroke_width=1,
) -> tuple[float, float]:
  x1, y1, x2, y2 = box
  box_width = x2 - x1
  box_height = y2 - y1

  avg_char_width = sum(font.getsize(char)[0] for char in ascii_letters) / len(
      ascii_letters
  )
  max_text_size = int((box_width * 0.95) / avg_char_width)
  lines = textwrap.fill(text, max_text_size)

  # Initial bounds
  ix, iy = (x2 + x1) / 2, (y2 + y1) / 2
  tx1, ty1, tx2, ty2 = draw.multiline_textbbox(
      (ix, iy), lines, font=font, stroke_width=stroke_width, align="center"
  )

  nx, ny = ix - (tx2 - tx1) / 2, iy - (ty2 - ty1) / 2

  if (ty2 - ty1) > box_height:
    new_font = ImageFont.truetype(
        font.path, int(font.size * box_height / (ty2 - ty1))
    )
    return fit_text(draw, box, text, new_font, stroke_width=stroke_width)

  return draw.multiline_text(
      (nx, ny),
      lines,
      font=font,
      align="center",
      stroke_fill=(0, 0, 0),
      stroke_width=stroke_width,
  )
