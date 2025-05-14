import os


def find_unique_files(dir1, dir2):
    files1 = set()
    for root, _, files in os.walk(dir1):
        for file in files:
            rel_path = os.path.relpath(os.path.join(str(root), file), dir1)
            files1.add(rel_path)

    files2 = set()
    for root, _, files in os.walk(dir2):
        for file in files:
            rel_path = os.path.relpath(os.path.join(str(root), file), dir2)
            files2.add(rel_path)

    unique_files = files1.symmetric_difference(files2)
    result = []
    for rel_path in unique_files:
        path1 = os.path.join(str(dir1), rel_path)
        path2 = os.path.join(str(dir2), rel_path)
        if rel_path in files1 and not os.path.exists(path2):
            result.append(path1)
        elif rel_path in files2 and not os.path.exists(path1):
            result.append(path2)
    return result


if __name__ == '__main__':
    folder1 = r'C:\Users\xl\curseforge\minecraft\Instances\PIZDAREZ\mods'
    folder2 = r'C:\Users\xl\AppData\Roaming\xlartas-launcher\xlartas-client\mods'
    unique = find_unique_files(folder1, folder2)
    for path in unique:
        print(path)
