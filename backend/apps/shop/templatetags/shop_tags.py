from django import template

register = template.Library()


@register.simple_tag()
def get_price_with_discount(price, discount: int):
    return str(int(price - price / 100 * discount))