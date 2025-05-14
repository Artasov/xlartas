# seordj/controllers/all.py

from django.shortcuts import render

from apps.seordj.utils import generate_seo_tags


async def index(request):
    return render(request, 'index.html', {
        'head': generate_seo_tags(
            request, robots='index, follow',
        )
    })
