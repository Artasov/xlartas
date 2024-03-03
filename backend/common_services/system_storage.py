import os
import psutil


class FolderSizeFinder:
    def __init__(self, path, min_size_gb):
        self.path = path
        self.min_size_gb = min_size_gb
        self.matching_folders = []

    @staticmethod
    def convert_bytes_to_gb(bytes_size):
        return bytes_size / (1024 ** 3)

    def get_folder_size(self, path):
        total_size = 0
        for root, dirs, files in os.walk(path):
            for file in files:
                try:
                    total_size += os.path.getsize(os.path.join(root, file))
                except FileNotFoundError:
                    continue
        return total_size

    def find_by_min_size(self):
        total_disk_space = psutil.disk_usage(self.path).total  # total disk space in bytes

        for root, dirs, _ in os.walk(self.path):
            folder_size = self.get_folder_size(root)
            folder_size_gb = self.convert_bytes_to_gb(folder_size)

            if folder_size_gb > self.min_size_gb:
                # Calculate the percentage of disk space used by the folder
                folder_size_percent = (folder_size / total_disk_space) * 100
                self.matching_folders.append((root, folder_size_gb, folder_size_percent))
                print(f"Found: {root} - Size: {folder_size_gb:.2f} GB\n{folder_size_percent:.2f}% of total space")

        print("Folders larger than", self.min_size_gb, "GB:")
        for folder, size_gb, size_percent in self.matching_folders:
            print(f"{folder} - Size: {size_gb:.2f} GB\n{size_percent:.2f}% of total space")


folder_finder = FolderSizeFinder("C:\\", min_size_gb=3)
folder_finder.find_by_min_size()
