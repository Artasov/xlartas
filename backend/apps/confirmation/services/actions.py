# confirmation/services/actions.py
from typing import TypedDict, Callable, NotRequired

from apps.confirmation.confirmation_loader import confirmation_actions


class ConfirmationResult(TypedDict):
    result: dict
    action: str


class ConfirmationAction(TypedDict):
    subject: str
    text: str
    func: NotRequired[Callable]


def is_action_exists(action: str) -> bool:
    return True if action in confirmation_actions else False
