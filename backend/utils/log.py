import logging


def get_global_logger() -> logging.Logger:
    """Return a logger configured with the global name."""
    return logging.getLogger('global')
