import logging
import time

from apps.xlmine.services.server.console import RconServerConsole

log = logging.getLogger('global')


def teleport_player_grid(
    left_top_x: int,
    left_top_z: int,
    side_length: int,
    player: str = 'xlartas',
    skip_squares: int = 0
) -> None:
    """
    Телепортирует игрока по всему миру квадратами размером 8 чанков (по умолчанию),
    начиная с левого верхнего угла. Можно пропустить первые skip_squares квадратов.

    :param left_top_x: X координата левого верхнего угла мира.
    :param left_top_z: Z координата левого верхнего угла мира.
    :param side_length: длина стороны мира (в блоках).
    :param player: ник игрока (по умолчанию 'xlartas').
    :param skip_squares: сколько первых квадратов пропустить в обходе.
    """
    console = RconServerConsole()
    chunk_size = 16
    chunks_per_square = 20
    step = chunk_size * chunks_per_square
    wait_seconds = 7
    current_square = 0

    for dz in range(0, side_length, step):
        for dx in range(0, side_length, step):
            if current_square < skip_squares:
                print(f'Пропускаем квадрат #{current_square + 1}')
                current_square += 1
                continue
            x = left_top_x + dx
            z = left_top_z + dz
            print(f'[{current_square + 1}] Телепорт {player} в координаты ({x}, {z})')
            command = f"execute as {player} run tp {x} 120 {z}"
            console.send_command(command)
            for i in range(wait_seconds):
                print(f'Ждём {i + 1}/{wait_seconds} сек')
                time.sleep(1)

            current_square += 1
