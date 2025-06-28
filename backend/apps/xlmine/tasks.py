# xlmine/tasks.py
from adjango.decorators import task
from celery import shared_task
import logging

from apps.xlmine.utils.map_render import teleport_player_grid

# ──────────────────────────────────────────────────────────────────────────────
# Жёстко заданные параметры «пробега».
# При желании вынесите их в settings или env-переменные.
SIDE_LENGTH = 8000  # Длина стороны мира в блоках
PLAYER_NICK = 'xlartas'  # Кого телепортируем

log = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────

@shared_task(
    soft_time_limit=60 * 60 * 6,  # 6 часов — с запасом
    time_limit=60 * 60 * 6,
)
@task('global')
def teleport_world_scan() -> None:
    """
    Фоновая задача Celery: пробегает квадратами 4 × 4 чанка по
    всему миру, телепортируя игрока с ником PLAYER_NICK.

    Параметры берутся из констант вверху файла.
    """
    LEFT_TOP_X = -SIDE_LENGTH // 2
    LEFT_TOP_Z = -SIDE_LENGTH // 2
    log.info(
        'Celery-task teleport_world_scan started — (%s, %s) side=%s player=%s',
        LEFT_TOP_X,
        LEFT_TOP_Z,
        SIDE_LENGTH,
        PLAYER_NICK,
    )
    teleport_player_grid(
        LEFT_TOP_X, LEFT_TOP_Z,
        SIDE_LENGTH, PLAYER_NICK,
        481
    )
    log.info('Celery-task teleport_world_scan finished')
