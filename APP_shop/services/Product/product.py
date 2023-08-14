from APP_shop.models import Product


class ProductService:
    def __init__(self, product: Product):
        self.product = product
