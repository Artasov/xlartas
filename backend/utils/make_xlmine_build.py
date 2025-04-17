# build_release.py
import hashlib
import json
import os
import shutil
import zipfile
from pathlib import Path

SOURCE_DIR = Path(r"C:\Users\xl\AppData\Roaming\xlartas-launcher\xlartas-client")
RELEASE_DIR = SOURCE_DIR.parent / "xlartas-client-release"
ARCHIVE_PATH = SOURCE_DIR.parent / "xlartas-client-release.zip"
SECURITY_PATH = SOURCE_DIR.parent / "security.json"

FILES_TO_COPY = [
    "version.txt",
    "servers.dat",
    "options.txt",
    "authlib-injector-1.2.5.jar",
]
DIRS_TO_COPY = [
    "assets",
    "versions",
    "resourcepacks",
    "shaderpacks",
    "mods",
    "libraries",
    "config",
]

EDITABLE_FILES = [
    # директории, которые пользователь может править
    "resourcepacks/",
    "shaderpacks/",
    # файлы‑конфиги, которые можно менять
    "options.txt",
    "servers.dat",
    'config/betterfpsdist.json',
    'config/bettergrass.json5',
    'config/blur.json',
    'config/chat_heads.json5',
    'config/cull-less-leaves.json',
    'config/durabilitytooltip-common.toml',
    'config/emojiful.json',
    'config/euphoria_patcher.properties',
    'config/fallingleaves.json',
    'config/indium-renderer.properties',
    'config/inventoryhud.json',
    'config/iris.properties',
    'config/itemphysiclite-client.json',
    'config/kleeslabs-common.toml',
    'config/languagereload.json',
    'config/lightoverlay.properties',
    'config/lithium.properties',
    'config/modelfix-client.json',
    'config/modernfix-mixins.properties',
    'config/moonlight-client.json',
    'config/moonlight-common.json',
    'config/moreculling.toml',
    'config/motionblur.properties',
    'config/MouseTweaks.cfg',
    'config/nyfsspiders.json',
    'config/particle_core_config.toml',
    'config/particle_core_disabled_optimizations.json',
    'config/ping-wheel.json',
    'config/smoothchunk.json',
    'config/sodium-extra-options.json',
    'config/sodium-extra.properties',
    'config/sodium-fingerprint.json',
    'config/sodium-mixins.properties',
    'config/sodium-options.json',
    'config/visuality.json',
    'config/visualworkbench-client.toml',
    'config/visual_workbench.json',
    'config/waveycapes.json',
    'config/weaponmaster_ydm_config.properties',
    'config/xaerominimap-common.txt',
    'config/xaerominimap.txt',
    'config/xaerominimap_entities.json',
    'config/xaeropatreon.txt',
    'config/xaeroplus.txt',
    'config/xaeroworldmap-common.txt',
    'config/xaeroworldmap.txt',
    'config/fabric/indigo-renderer.properties',
    'config/fzzy_config/keybinds.toml',
    'config/jade/sort-order.json',
    'config/jade/usernamecache.json',
    'config/jamlib/known_suspicious_jars.txt',
    'config/jei/blacklist.cfg',
    'config/jei/ingredient-list-mod-sort-order.ini',
    'config/jei/ingredient-list-type-sort-order.ini',
    'config/jei/recipe-category-sort-order.ini',
    'config/justzoom/config.txt',
    'config/mobtimizations/features-customization.toml',
    'config/mobtimizations/features.toml',
    'config/sound_physics_remastered/allowed_sounds.properties',
    'config/sound_physics_remastered/occlusion.properties',
    'config/sound_physics_remastered/reflectivity.properties',
    'config/sound_physics_remastered/soundphysics.properties',
    'config/voicechat/username-cache.json',
    'config/voicechat/voicechat-client.properties',
    'config/voicechat/voicechat-volumes.properties',
    'config/yosbr/options.txt',
]


# ───────────────── helpers ────────────────────────────────────────────────────
def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def is_editable(rel: str) -> bool:
    for entry in EDITABLE_FILES:
        if entry.endswith("/"):
            # директория
            if rel.startswith(entry):
                return True
        else:
            # конкретный файл
            if rel == entry:
                return True
    return False


def log(msg: str) -> None:
    print(f"[BUILD] {msg}")


# ───────────────── подготовка директории релиза ──────────────────────────────
if RELEASE_DIR.exists():
    shutil.rmtree(RELEASE_DIR)
RELEASE_DIR.mkdir(parents=True, exist_ok=True)
log("Temporary release directory prepared")

# ───────────────── копирование файлов ────────────────────────────────────────
for fname in FILES_TO_COPY:
    src = SOURCE_DIR / fname
    dst = RELEASE_DIR / fname
    if src.exists():
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        log(f"Copied file: {fname}")

for dname in DIRS_TO_COPY:
    src = SOURCE_DIR / dname
    dst = RELEASE_DIR / dname
    if src.exists():
        shutil.copytree(src, dst)
        log(f"Copied directory: {dname}")

# ───────────────── формирование security.json ───────────────────────────────
security: dict[str, dict] = {
    "dirs_files_count": {},
    "editable_files": EDITABLE_FILES,
    "protected_files": {},
}

for dirname in ["mods", "config"]:
    full_dir = RELEASE_DIR / dirname
    security["dirs_files_count"][dirname] = (
        sum(1 for p in full_dir.rglob("*") if p.is_file()) if full_dir.exists() else 0
    )

for root, _, files in os.walk(RELEASE_DIR):
    for file in files:
        rel_path = os.path.relpath(os.path.join(root, file), RELEASE_DIR).replace("\\", "/")
        if is_editable(rel_path):
            continue  # разрешено менять
        security["protected_files"][rel_path] = sha256(Path(root) / file)

SECURITY_PATH.write_text(json.dumps(security, ensure_ascii=False, indent=2), encoding="utf-8")
log(f"security.json written to {SECURITY_PATH}")

# ───────────────── создание архива ───────────────────────────────────────────
if ARCHIVE_PATH.exists():
    ARCHIVE_PATH.unlink()
with zipfile.ZipFile(ARCHIVE_PATH, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, _, files in os.walk(RELEASE_DIR):
        for file in files:
            fp = Path(root) / file
            zipf.write(fp, fp.relative_to(RELEASE_DIR))
log(f"Archive created at {ARCHIVE_PATH}")

# ───────────────── очистка ───────────────────────────────────────────────────
shutil.rmtree(RELEASE_DIR, ignore_errors=True)
log("Temporary release directory cleaned up")

print("[BUILD] Done")
