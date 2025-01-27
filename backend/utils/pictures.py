from PIL import ExifTags


class CorrectOrientation:
    def process(self, image):
        # Получаем EXIF-данные
        exif = image.getexif()
        if exif:
            for tag, value in exif.items():
                tag_name = ExifTags.TAGS.get(tag, tag)
                if tag_name == 'Orientation':
                    orientation = value
                    break
            else:
                orientation = None

            # Корректируем ориентацию изображения
            if orientation == 3:
                image = image.rotate(180, expand=True)
            elif orientation == 6:
                image = image.rotate(270, expand=True)
            elif orientation == 8:
                image = image.rotate(90, expand=True)
        return image
