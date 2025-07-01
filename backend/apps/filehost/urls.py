# filehost/urls.py
from django.urls import path

from apps.filehost.controllers.accesses import (
    grant_access, revoke_access, list_accesses, set_public
)
from apps.filehost.controllers.base import (
    move_item, get_full_tree, bulk_delete_items,
    bulk_update_items, upload_files, download_file,
    download_archive,
)
from apps.filehost.controllers.files import (
    get_file_by_id, get_all_files, add_file,
    get_favorite_files, toggle_favorite, get_storage_usage
)
from apps.filehost.controllers.folders import (
    get_folder_by_id, get_all_folders,
    get_folder_content, add_folder,
)
from apps.filehost.controllers.tags import (
    create_tag, add_tag, delete_item, update_tag,
    get_all_tags_in_folder, get_user_tags,
    filter_by_tag_in_folder, delete_tag, remove_tag
)

urlpatterns = [
    path('tree/', get_full_tree, name='get_full_tree'),

    path('file/', get_file_by_id, name='get_file_by_id'),
    path('folder/', get_folder_by_id, name='get_folder_by_id'),
    path('files/', get_all_files, name='get_all_files'),
    path('folders/', get_all_folders, name='get_all_folders'),
    path('file/add/', add_file, name='add_file'),
    path('folder/add/', add_folder, name='add_folder'),
    path('folder/content/', get_folder_content, name='get_folder_content'),
    path('files/upload/', upload_files, name='upload_files'),

    path('files/favorite/', get_favorite_files, name='get_favorite_files'),
    path('files/toggle_favorite/', toggle_favorite, name='toggle_favorite'),
    path('storage/usage/', get_storage_usage, name='get_storage_usage'),

    path('download/file/', download_file, name='download_file'),
    path('download/archive/', download_archive, name='download_archive'),

    path('item/move/', move_item, name='move_item'),
    path('item/delete/', delete_item, name='delete_item'),
    path('items/bulk_delete/', bulk_delete_items, name='bulk_delete_items'),
    path('items/bulk_update/', bulk_update_items, name='bulk_update_items'),

    path('tags/create/', create_tag, name='create_tag'),
    path('tags/add/', add_tag, name='add_tag'),
    path('tags/user/', get_user_tags, name='get_user_tags'),
    path('tags/delete/', delete_tag, name='delete_tag'),
    path('tags/update/', update_tag, name='update_tag'),
    path('tags/remove/', remove_tag, name='remove_tag'),
    path('folder/tags/', get_all_tags_in_folder, name='get_all_tags_in_folder'),
    path('folder/filter_by_tag/', filter_by_tag_in_folder, name='filter_by_tag_in_folder'),

    path('access/grant/', grant_access, name='grant_access'),
    path('access/revoke/', revoke_access, name='revoke_access'),
    path('access/list/', list_accesses, name='list_accesses'),
    path('access/public/', set_public, name='set_public'),
]
