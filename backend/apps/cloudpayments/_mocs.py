# cloudpayments/_mocs.py
_success_response = {
    "publicId": "pk_66a6bc1e960329de916fb565574a5",
    "description": "Оплата заказа #1f02ff14-24fe-6958-974f-5e1a45a06963",
    "amount": 594,
    "currency": "RUB",
    "invoiceId": "1f02ff14-24fe-6958-974f-5e1a45a06963",
    "accountId": "",
    "email": "",
    "data": {
        "CloudPayments": {
            "CustomerReceipt": {
                "Items": [
                    {
                        "label": "Оплата заказа #1f02ff14-24fe-6958-974f-5e1a45a06963",
                        "price": "594.00",
                        "quantity": 1,
                        "amount": "594.00",
                        "vat": 0,
                        "method": 0,
                        "object": 4,
                        "measurementUnit": "шт"
                    }
                ],
                "calculationPlace": "localhost:8000",
                "taxationSystem": 0,
                "email": "ivanhvalevskey@gmail.com",
                "phone": "None"
            }
        }
    },
    "skin": "mini",
    "autoClose": 0
}

_fail_response = {

}
