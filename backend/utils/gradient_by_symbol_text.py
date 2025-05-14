def hex_to_rgb(hex_color: str) -> tuple:
    """
    Преобразует HEX-строку (например, "#FF0000" или "FF0000") в кортеж RGB.
    """
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6:
        raise ValueError("HEX цвет должен состоять из 6 символов.")
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return r, g, b


def rgb_to_hex(rgb: tuple) -> str:
    """
    Преобразует кортеж RGB в HEX-строку вида "RRGGBB".
    """
    return "{:02X}{:02X}{:02X}".format(*rgb)


def interpolate_color(start_rgb: tuple, end_rgb: tuple, factor: float) -> tuple:
    """
    Интерполирует между двумя цветами.
    factor должен быть в диапазоне от 0.0 до 1.0, где 0.0 - start_rgb, 1.0 - end_rgb.
    """
    return (
        int(start_rgb[0] + (end_rgb[0] - start_rgb[0]) * factor),
        int(start_rgb[1] + (end_rgb[1] - start_rgb[1]) * factor),
        int(start_rgb[2] + (end_rgb[2] - start_rgb[2]) * factor),
    )


def generate_gradient_text(text: str, start_hex: str, end_hex: str) -> str:  # noqa
    """
    Генерирует строку с градиентом для каждого символа.

    Каждый символ текста окрашивается в свой цвет, вычисленный как линейная интерполяция
    между start_hex и end_hex. Формат результата: "&#RRGGBB<символ>"
    """
    if not text:
        return ""

    start_rgb = hex_to_rgb(start_hex)
    end_rgb = hex_to_rgb(end_hex)
    gradient_text = ""
    n = len(text)

    for i, char in enumerate(text):
        # Если в тексте один символ, фактор равен 0
        factor = i / (n - 1) if n > 1 else 0
        current_rgb = interpolate_color(start_rgb, end_rgb, factor)
        current_hex = rgb_to_hex(current_rgb)
        # Форматирование в виде "&#RRGGBB<символ>"
        gradient_text += f"&#{current_hex}{char}"

    return gradient_text


# Пример использования
if __name__ == '__main__':
    text = "Нормис"
    start_color = "#FF0000"  # Красный
    end_color = "#00FF00"  # Зеленый
    result = generate_gradient_text(text, start_color, end_color)
    print(result)
