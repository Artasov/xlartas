// Modules/Order/PayChooser.tsx
// import React, {useState} from 'react';
// import {IPaymentSystem} from 'types/commerce/shop';
// import PaymentTBank from './providers/PaymentTBank';
// import PaymentCloud from './providers/PaymentCloud';
// import PaymentTBankInstallment from './providers/PaymentTBankInstallment';
// import {FC} from "WideLayout/Layouts";
//
// interface Props {
//     orderId: string;
//     amount: number;
//     paymentSystems: IPaymentSystem[];
// }
//
// const COMPONENTS: Record<IPaymentSystem, React.FC<any>> = {
//     tbank: PaymentTBank,
//     cloud_payment: PaymentCloud,
//     tbank_installment: PaymentTBankInstallment,
//     handmade: () => <p>Оплата оффлайн — свяжется менеджер.</p>,
// };
//
// const PayChooser: React.FC<Props> = ({orderId, amount, paymentSystems}) => {
//     const [system, setSystem] = useState<IPaymentSystem | null>(null);
//
//     const Selected = system ? COMPONENTS[system] : null;
//
//     return (
//         <FC>
//             <h2>Выберите способ оплаты</h2>
//             <ul className="list-unstyled d-flex gap-2 flex-wrap">
//                 {paymentSystems.map(ps => (
//                     <li key={ps}>
//                         <button
//                             className={`btn ${ps === system ? 'btn-primary' : 'btn-outline-primary'}`}
//                             onClick={() => setSystem(ps)}
//                         >
//                             {ps}
//                         </button>
//                     </li>
//                 ))}
//             </ul>
//
//             {Selected && (
//                 <div className="mt-3">
//                     <Selected orderId={orderId} amount={amount}/>
//                 </div>
//             )}
//         </FC>
//     );
// };
//
// export default PayChooser;
