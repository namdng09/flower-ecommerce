import { useEffect } from 'react';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface MiniCartModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
}

export default function MiniCartModal({ isOpen, onClose, items }: MiniCartModalProps) {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || items.length === 0) return null;

    return (
        <div className='absolute top-[60px] right-4 w-[350px] bg-white rounded-xl shadow-lg z-50 border border-gray-200 p-4'>
            <div className='flex justify-between items-start'>
                <div>
                    <p className='font-semibold text-black'>{items[0].name}</p>
                    <p className='text-pink-600 font-semibold text-lg'>
                        {items[0].price.toLocaleString()} VNĐ
                    </p>
                    <p className='text-gray-400 text-sm'>SỐ LƯỢNG: x{items[0].quantity}</p>
                </div>
                <img src={items[0].image} alt={items[0].name} className='w-16 h-16 object-cover rounded-md' />
                <button onClick={onClose} className='text-gray-500 hover:text-black text-xl font-bold ml-2'>
                    &times;
                </button>
            </div>

            <hr className='my-3' />

            <div className='text-sm space-y-1 text-black'>
                <div className='flex justify-between'>
                    <span>Tổng sản phẩm:</span>
                    <span>{totalQuantity}</span>
                </div>
                <div className='flex justify-between'>
                    <span>Tổng tiền:</span>
                    <span className='text-pink-600 font-semibold'>{totalPrice.toLocaleString()} VNĐ</span>
                </div>
            </div>

            <div className='flex gap-2 mt-4'>
                <button className='flex-1 py-2 border border-pink-500 text-pink-600 rounded-lg text-sm font-medium hover:bg-pink-50'>
                    Xem giỏ hàng
                </button>
                <button className='flex-1 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600'>
                    Thanh toán
                </button>
            </div>
        </div>
    );
}
