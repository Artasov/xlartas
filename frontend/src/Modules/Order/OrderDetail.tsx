// Modules/Order/OrderDetail.tsx
import React, {useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import CircularProgress from "Core/components/elements/CircularProgress";
import {useErrorProcessing} from "Core/components/ErrorProvider";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import copyToClipboard from "Utils/clipboard";
import moment from "moment";
import OrderStatus from "Order/OrderStatus";
import {IOrder} from "types/commerce/shop";
import OrderActions from "Order/OrderActions";
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {useTheme} from "Theme/ThemeContext";
import {FCCC, FR, FRSC} from "wide-containers";
import {useApi} from "../Api/useApi";
import {Alert, AlertTitle} from "@mui/material";

interface OrderDetailProps {
    className?: string;
}

const OrderDetail: React.FC<OrderDetailProps> = ({className}) => {
    const {id} = useParams<{ id: string }>();
    const {isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const {notAuthentication} = useErrorProcessing();
    const [order, setOrder] = useState<IOrder | null>(null);
    const [orderNotFound, setOrderNotFound] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
    const {plt} = useTheme();
    const {api} = useApi();

    useEffect(() => {
        if (!isAuthenticated) {
            notAuthentication();
            return;
        }
        setLoading(true);
        api.get(`/api/v1/orders/${id}/`).then(data => {
            setOrder(data);
            if (!data) setOrderNotFound(true);
        }).catch(_=>null).finally(() => setLoading(false));
    }, [id, isAuthenticated]);

    if (loading) return <FCCC w={'100%'} mt={5}><CircularProgress size="90px"/></FCCC>;
    if (orderNotFound || !order) return <div className={'p-3 text-center mt-2'}>Заказ не найден.</div>;

    return (
        <div className={`${className} py-3 overflow-y-auto no-scrollbar position-relative`}>
            <div className={'fc gap-2'}>
                <div className={'fc gap-1'}>
                    <div className={'frsc gap-2'} onClick={() => copyToClipboard(String(order.id))}>
                        <span className={`fs-6`} style={{color: plt.text.primary50}}>
                            # {order.id}
                        </span>
                        <ContentCopyIcon className={'fs-5'}/>
                    </div>
                    <Alert severity="info" variant="outlined">
                        <AlertTitle>Внимание</AlertTitle>
                        CloudPayments скоро будет подключен, но пока оплата через личку{' '}
                        <a href="https://t.me/artasov"
                           target="_blank" className={'tdn'}
                           rel="noopener noreferrer"
                           style={{color: plt.info.main}}
                        >@artasov</a>. Пишите id заказа. Кликните на него, чтобы скопировать.
                    </Alert>
                    <div className={'frbc flex-wrap'}>
                        <FRSC wrap pr={1} g={1} mt={1}>
                            <FR cls={`fs-5 text-nowrap`} px={1} rounded={3}
                                bg={plt.text.primary + '22'}
                                color={plt.text.primary + '99'}>
                                {order.product.polymorphic_ctype.name}
                            </FR>
                            <FR cls={`fs-5 text-nowrap`} color={plt.text.primary + '99'}>
                                {order.product.name}
                            </FR>
                        </FRSC>
                        <span
                            className={`fs-5 fw-3 mt-2`}
                            style={{
                                color: plt.text.primary + '99',
                                lineHeight: '1rem'
                            }}>
                            {order.payment?.amount !== undefined
                                   ? `${parseFloat(String(order.payment.amount)) % 1 === 0
                                       ? parseInt(String(order.payment.amount))
                                       : parseFloat(String(order.payment.amount)).toFixed(2)
                                     } ${order.currency}`
                                   : ''}
                        </span>

                    </div>
                </div>
                <div className={'fc'}>
                    <OrderStatus order={order}/>
                    <span>Payment system: {order.payment_system}</span>
                    <span>
                        <span>Created </span>
                        <span>
                            {moment(order.created_at).calendar().charAt(0).toLowerCase() +
                                moment(order.created_at).calendar().slice(1)}
                        </span>
                    </span>
                </div>
                <OrderActions
                    extended={true}
                    order={order}
                    onSomeUpdatingOrderAction={setOrder}
                    setLoading={setIsActionLoading}/>
            </div>
            {isActionLoading && (
                <FCCC
                    pos="absolute"
                    cls="backdrop-blur-10"
                    top={0}
                    left={0}
                    zIndex={8}
                    rounded={3}
                    width="100%"
                    height="100%"
                >
                    <CircularProgress size="3rem"/>
                </FCCC>
            )}
        </div>
    );
};

export default OrderDetail;
