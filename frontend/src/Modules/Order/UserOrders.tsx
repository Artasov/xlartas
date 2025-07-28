// Modules/Order/UserOrders.tsx
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'Utils/nextRouter';
import {useErrorProcessing} from 'Core/components/ErrorProvider';
import {useAuth} from 'Auth/AuthContext';
import {IOrder} from 'types/commerce/shop';
import OrderItem from 'Order/OrderItem';
import {FC, FR} from 'wide-containers';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import {useApi} from 'Api/useApi';
import Collapse from '@mui/material/Collapse';

const UserOrders: React.FC = () => {
    const {user, isAuthenticated} = useAuth();
    const {notAuthentication} = useErrorProcessing();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const {api} = useApi();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [animate, setAnimate] = useState(false);

    /* ---------- загрузка заказов ---------- */
    useEffect(() => {
        if (user === null || !isAuthenticated) {
            notAuthentication();
            return;
        }

        setAnimate(false);

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
        setOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));

    const handleOrderDelete = (deletedId: string) =>
        setOrders(prev => prev.filter(o => String(o.id) !== deletedId));

    /* ---------- рендер ---------- */
    return (
        <FR wrap w="100%" g={1.2} py={1} px={2} position="relative" cls={'user-orders'}>
            {/* ---------------- Лоадер ---------------- */}
            <CircularProgressZoomify in={loading} mt={10} size="90px"/>

            {/* ---------------- Список заказов ---------------- */}
            {orders.length > 0 &&
                orders.map((order, index) => (
                    <Collapse
                        key={order.id}
                        in={animate}
                        appear
                        sx={{width: '100%'}}
                        timeout={450 + index * 100}
                        unmountOnExit={false}
                    >
                        <OrderItem
                            order={order}
                            onClick={() => navigate(`/orders/${order.id}`)}
                            onSomeUpdatingOrderAction={handleOrderUpdate}
                            onOrderDeleted={() => handleOrderDelete(String(order.id))}
                        />
                    </Collapse>
                ))}

            {/* ---------------- Сообщение «нет заказов» ---------------- */}
            {!loading && orders.length === 0 && (
                <FC
                    w="100%"
                    g={1}
                    p={2}
                    h="100%"
                    scroll="y-auto"
                    cls="no-scrollbar"
                    textAlign="center"
                >
                    <p>У вас ещё нет заказов</p>
                </FC>
            )}
        </FR>
    );
};

export default UserOrders;
