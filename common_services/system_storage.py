import os
import psutil


class FolderSizeFinder:
    """

    """
    def __init__(self, path, min_size_gb):
        self.path = path
        self.min_size_gb = min_size_gb
        self.total_size = 0
        self.matching_folders = []

    def convert_bytes_to_gb(self, bytes_size):
        return bytes_size / (1024 ** 3)

    def find_by_min_size(self):
        total_blocks = psutil.disk_usage(self.path).total

        for root, dirs, files in os.walk(self.path):
            folder_size = sum(os.path.getsize(os.path.join(root, file)) for file in files)
            self.total_size += folder_size
            folder_size_gb = self.convert_bytes_to_gb(folder_size)

            if folder_size_gb > self.min_size_gb:
                self.matching_folders.append(root)
                print("Found:", root)
                self.print_progress(total_blocks)

        print("Folders larger than", self.min_size_gb, "GB:")
        for folder in self.matching_folders:
            print(folder)

    def print_progress(self, total_blocks):
        disk_usage_gb = self.convert_bytes_to_gb(self.total_size)
        percent = (self.total_size / total_blocks) * 100
        print(f"Progress: {percent:.2f}% ({disk_usage_gb:.2f} GB out of total disk)")


folder_finder = FolderSizeFinder("E:\\", min_size_gb=3)

folder_finder.find_by_min_size()
