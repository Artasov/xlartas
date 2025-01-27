// Order/UserOrders.tsx
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {useErrorProcessing} from "Core/components/ErrorProvider";
import {AuthContext, AuthContextType} from "Auth/AuthContext";

import {axios} from "Auth/axiosConfig";
import {IOrder} from "types/commerce/shop";
import pprint from 'Utils/pprint';
import OrderItem from "Order/OrderItem";
import {FC as FCC, FRC} from "WideLayout/Layouts";
import CircularProgress from "Core/components/elements/CircularProgress";

interface UserOrdersProps {
    className?: string;
}

const UserOrders: React.FC<UserOrdersProps> = ({className}) => {
    const {user, isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const {byResponse, notAuthentication} = useErrorProcessing();
    const [orders, setOrders] = useState<IOrder[]>([]);

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user === null || !isAuthenticated) {
            notAuthentication();
            return;
        }
        setOrders([]);
        setLoading(true);
        axios.get('/api/v1/user/orders/')
            .then((response) => {
                pprint('User Orders', response.data);
                setOrders(response.data);
            }).catch(error => byResponse(error)).finally(() => {
            setLoading(false)
        });
    }, [user]);

    const handleOrderUpdate = (updatedOrder: IOrder) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.id === updatedOrder.id ? updatedOrder : order
            )
        );
    };

    return (
        <div className={`${className} fr flex-wrap gap-3 py-3 overflow-y-auto no-scrollbar`}>
            {orders.length > 0 ?
                orders.map((order) => (
                    <OrderItem
                        onClick={() => navigate(`/orders/${order.id}`)}
                        key={order.id}
                        order={order}
                        onSomeUpdatingOrderAction={handleOrderUpdate}
                    />
                ))
                : loading
                    ? <FRC w={'100%'} mt={5}><CircularProgress size={'110px'}/></FRC>
                    : <FCC w={'100%'} g={1} p={2} h={'100%'} scroll={'y-auto'}
                           cls={'no-scrollbar'} textAlign={'center'}>
                        <p>У вас еще нет заказов</p>
                    </FCC>
            }
        </div>
    );
};

export default UserOrders;
