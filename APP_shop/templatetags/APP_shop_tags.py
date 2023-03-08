from django import template

register = template.Library()


@register.simple_tag()
def get_price_with_sale(price, sale: int):
    return str(int(price - price / 100 * sale))