# filehost/utils.py
"""Utility functions for filehost app."""
from rest_framework.request import Request


def parse_pagination(request: Request) -> tuple[int, int, int]:
    """Return page, page_size and offset from request query params."""
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("page_size", 10))
    offset = (page - 1) * page_size
    return page, page_size, offset
