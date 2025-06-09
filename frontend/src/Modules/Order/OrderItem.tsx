// Modules/Order/OrderItem.tsx
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';

import moment from "moment";
import OrderActions from "Order/OrderActions";
import {IOrder} from "types/commerce/shop";
import OrderStatus from "Order/OrderStatus";
import {FC, FCCC, FR, FRBC, FRSC} from "wide-containers";
import {useTheme} from "Theme/ThemeContext";
import CircularProgress from "Core/components/elements/CircularProgress";

interface OrderItemProps {
    order: IOrder;
    onClick: () => void;
    onSomeUpdatingOrderAction: (updatedOrder: IOrder) => void;
    onOrderDeleted?: () => void;
}

const OrderItem: React.FC<OrderItemProps> = (
    {
        order,
        onClick,
        onSomeUpdatingOrderAction,
        onOrderDeleted,
    }) => {
    const navigate = useNavigate();
    const {plt} = useTheme();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    return (
        <FRBC p={2} g={1} rounded={3} wrap flexGrow={1}
              cls={`hover-scale-1 ftrans-200-eio`} pos={'relative'}
              boxShadow={`0.06rem 0.06rem 0.37rem -0.1rem ${plt.bg.contrast20}`}>
            <FC g={1} w={'100%'} color={plt.text.primary70}>
                <FC onClick={onClick}>
                    <span className={`fs-7`} style={{color: plt.text.primary40}}>
                        # {order.id}
                    </span>
                    <FRBC wrap mb={1}>
                        <FRSC wrap pr={1} g={1} mt={1}>
                            <FR cls={`fs-5 text-nowrap`} px={1} rounded={3}
                                bg={plt.bg.contrast10} color={plt.text.primary80}>
                                {order.product.polymorphic_ctype.name}
                            </FR>
                            <FR cls={`fs-5`} color={plt.text.primary80}>
                                {order.product.name}
                            </FR>
                        </FRSC>
                        <span className={`fs-5 fw-3 mt-2`}
                              style={{
                                  color: plt.text.primary80,
                                  lineHeight: '1rem'
                              }}>
                            {order.payment?.amount !== undefined
                                ? `${order.payment.amount} ${order.currency}`
                                : ''}
                        </span>
                    </FRBC>
                    <OrderStatus order={order}/>
                    {order?.promocode && <span>
                        <span>Промокод: </span>
                        <span>{order.promocode.name} - {order.promocode.code}</span>
                    </span>}
                </FC>
                <FRBC>
                    <span>
                        <span>Создан </span>
                        <span className={'fw-6'}>
                            {moment(order.created_at).calendar().charAt(0).toLowerCase() +
                                moment(order.created_at).calendar().slice(1)}
                        </span>
                    </span>
                    <OrderActions
                        order={order}
                        onSomeUpdatingOrderAction={onSomeUpdatingOrderAction}
                        onOrderDeleted={onOrderDeleted}
                        setLoading={setIsLoading}/>
                </FRBC>
            </FC>
            {isLoading && (
                <FCCC pos={'absolute'} className={'backdrop-blur-10'}
                      top={0} left={0} zIndex={8} rounded={3}
                      w={'100%'} h={'100%'}>
                    <CircularProgress size={'3rem'}/>
                </FCCC>
            )}
        </FRBC>
    );
};

export default OrderItem;
