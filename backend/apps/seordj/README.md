# Seo React Django

## Installation

*

```
pip install seo-react-django
```

* Add `{{ head }}` inside the `<head>` section of `public/index.html`
  ```html
  <head>
    {{ head|safe }}
  </head>
  ```
  > Теперь при билде react у вас всегда будет блок для последующей вставки любых `head` тегов
* 