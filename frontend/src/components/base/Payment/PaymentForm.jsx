import React, {useEffect} from 'react';
import './PaymentForm.css';
import {TINKOFF_TERMINAL_KEY} from "../../../services/base/axiosConfig";
import {useAuth} from "../auth/useAuth";
import {AuthContext} from "../auth/AuthContext/AuthContext";
import {Message} from "../Message"; // Assume this CSS file contains the styles from your <style> block

const PaymentForm = ({terminalKey = TINKOFF_TERMINAL_KEY, amount, orderId}) => {
    const {user, isAuthenticated, updateCurrentUser} = useAuth(AuthContext);
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://securepay.tinkoff.ru/html/payForm/js/tinkoff_v2.js";
        script.async = true;
        document.body.appendChild(script);

        Message.success('Great! Look at the order details and if everything is correct, click PAY.', 15000)

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const {description, amount, email, phone, receipt} = form;

        if (receipt.value) {
            if (!email.value && !phone.value) {
                alert("Поле E-mail или Phone не должно быть пустым");
                return;
            }

            receipt.value = JSON.stringify({
                "EmailCompany": "mail@mail.com",
                "Taxation": "patent",
                "Items": [{
                    "Name": description.value || "Оплата",
                    "Price": amount.value + '00',
                    "Quantity": 1.00,
                    "Amount": amount.value + '00',
                    "PaymentMethod": "full_prepayment",
                    "PaymentObject": "service",
                    "Tax": "none"
                }]
            });
        }

        window.pay(form); // Assuming `pay` is defined in the Tinkoff script
    };

    return (
        <div className="fccc">
            <h1 className="text-center fs-04">DEPOSIT</h1>
            <ul className={'fs-5 fw-5 text-white-c0 w-100 rounded-3 p-1'}>
                <li>User: {user.username}</li>
                <li>Email: <span className={'fs-6 overflow-x-auto no-scrollbar'}>{user.email}</span></li>
                <li>Amount: {amount} RUB</li>
            </ul>
            <form className="payform-tinkoff" onSubmit={handleSubmit}>
                <input type="hidden" name="terminalkey" value={terminalKey}/>
                <input type="hidden" name="frame" value="false"/>
                <input type="hidden" name="language" value="ru"/>
                <input type="hidden" name="receipt" value=""/>
                <input type="hidden" name="amount" value={amount} required/>
                <input type="hidden" name="order" value={orderId}/>
                <input type="hidden" name="description"/>
                <input type="hidden" name="name"/>
                <input type="hidden" name="email" value={user.email}/>
                <input type="hidden" name="phone"/>
                <input className="payform-tinkoff-row mt-3 fs-5 payform-tinkoff-btn border-0 fw-bold px-5 py-2"
                       type="submit" value="Pay"/>
            </form>
        </div>
    );
};

export default PaymentForm;
