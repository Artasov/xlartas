// Modules/Order/UserOrders.tsx
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useErrorProcessing} from 'Core/components/ErrorProvider';
import {AuthContext, AuthContextType} from 'Auth/AuthContext';
import {IOrder} from 'types/commerce/shop';
import OrderItem from 'Order/OrderItem';
import {FC as FCC, FCCC, FR} from 'wide-containers';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {useApi} from 'Api/useApi';
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

    const [loading, setLoading] = useState<boolean>(false);
    const [animate, setAnimate] = useState<boolean>(false);        // ⬅️ логика проще

    /* ---------- загрузка заказов ---------- */
    useEffect(() => {
        if (user === null || !isAuthenticated) {
            notAuthentication();
            return;
        }

        setLoading(true);
        setAnimate(false);                                         // ⬅️ сброс анимации

        api.get('/api/v1/user/orders/')
            .then(data => setOrders(data))
            .finally(() => setLoading(false));
    }, [user, isAuthenticated, api, notAuthentication]);

    /* ---------- старт анимации после загрузки ---------- */
    useEffect(() => {
        if (!loading) setAnimate(true);
    }, [loading]);

    /* ---------- колбэки обновления/удаления ---------- */
    const handleOrderUpdate = (updatedOrder: IOrder) =>
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));

    const handleOrderDelete = (deletedId: string) =>
        setOrders(prev => prev.filter(o => String(o.id) !== deletedId));

    /* ---------- рендер ---------- */
    return (
        <FR wrap w="100%" g={2} py={1} cls={className}>
            {orders.length > 0 ? (
                orders.map((order, index) => (
                    <Collapse
                        key={order.id}
                        in={animate}
                        appear
                        sx={{width: '100%'}}                                         /* ⬅️ включаем enter-анимацию при маунте */
                        timeout={250 + index * 100}                      /* «каскад» по 100 мс */
                        unmountOnExit={false}
                    >
                        <OrderItem
                            order={order}
                            onClick={() => navigate(`/orders/${order.id}`)}
                            onSomeUpdatingOrderAction={handleOrderUpdate}
                            onOrderDeleted={() => handleOrderDelete(String(order.id))}
                        />
                    </Collapse>
                ))
            ) : loading ? (
                <FCCC w="100%" mt={5}>
                    <CircularProgress size="90px"/>
                </FCCC>
            ) : (
                <FCC w="100%" g={1} p={2} h="100%" scroll="y-auto"
                     cls="no-scrollbar" textAlign="center">
                    <p>У вас ещё нет заказов</p>
                </FCC>
            )}
        </FR>
    );
};

export default UserOrders;
