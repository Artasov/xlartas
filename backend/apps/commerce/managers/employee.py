# commerce/managers/employee.py
from adjango.managers.polymorphic import APolymorphicManager


def get_legal_document_path(instance, filename):
    return f'legal_documents/{instance.employee.user.username}/{filename}'


class EmployeeManager(APolymorphicManager):
    pass
