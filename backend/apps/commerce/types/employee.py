# commerce/types/employee.py
from typing import TypedDict


class AvailabilityInterval(TypedDict):
    start: str  # YYYY-MM-DDTHH:MM:SS±HH:MM
    end: str  # YYYY-MM-DDTHH:MM:SS±HH:MM


class AvailabilitySlot(TypedDict):
    start: str  # YYYY-MM-DDTHH:MM:SS±HH:MM
    end: str  # YYYY-MM-DDTHH:MM:SS±HH:MM
