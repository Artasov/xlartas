// Modules/Order/UserOrders.tsx
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {useErrorProcessing} from "Core/components/ErrorProvider";
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {IOrder} from "types/commerce/shop";
import OrderItem from "Order/OrderItem";
import {FC as FCC, FCCC, FR} from "wide-containers";
import CircularProgress from "Core/components/elements/CircularProgress";
import {useApi} from "../Api/useApi";
import Collapse from '@mui/material/Collapse';

interface UserOrdersProps {
    className?: string;
}

const UserOrders: React.FC<UserOrdersProps> = ({className}) => {
    const {user, isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const {notAuthentication} = useErrorProcessing();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const {api} = useApi();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (user === null || !isAuthenticated) {
            notAuthentication();
            return;
        }
        setOrders([]);
        setLoading(true);
        api.get('/api/v1/user/orders/').then(
            data => setOrders(data)
        ).finally(() => setLoading(false));
    }, [user, isAuthenticated]);

    useEffect(() => {
        if (!loading) setAnimate(true);
    }, [loading]);

    const handleOrderUpdate = (updatedOrder: IOrder) => {
        setOrders((prevOrders) =>
            prevOrders.map(order => order.id === updatedOrder.id ? updatedOrder : order)
        );
    };
    const handleOrderDelete = (deletedOrderId: string) => {
        setOrders(prev => prev.filter(o => o.id !== deletedOrderId));
    };

    return (
        <FR wrap w={'100%'} g={2} py={1} cls={`${className}`}>
            {orders.length > 0 ?
                orders.map((order, index) => (
                    <Collapse
                        key={order.id}
                        in={animate}
                        timeout={200 + index * 100}
                        mountOnEnter
                        unmountOnExit={false}
                    >
                        <OrderItem
                            onClick={() => navigate(`/orders/${order.id}`)}
                            order={order}
                            onSomeUpdatingOrderAction={handleOrderUpdate}
                            // передаём колбэк удаления внутрь OrderActions
                            onOrderDeleted={() => handleOrderDelete(String(order.id))}
                        />
                    </Collapse>
                ))
                : loading
                    ? <FCCC w={'100%'} mt={5}><CircularProgress size="90px"/></FCCC>
                    : <FCC w={'100%'} g={1} p={2} h={'100%'} scroll={'y-auto'}
                           cls={'no-scrollbar'} textAlign={'center'}>
                        <p>У вас еще нет заказов</p>
                    </FCC>
            }
        </FR>
    );
};

export default UserOrders;
