# Seo React Django

## Installation

*
```
pip install seo-react-django
```
* Add `{{ head }}` to `public/index.html` to `<head>`
  ```html
  <head>
    {{ head|safe }}
  </head>
  ```
  > Теперь при билде react у вас всегда будет блок для последующей вставки любых `head` тегов
* 