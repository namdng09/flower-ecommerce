import { Link, useOutletContext } from 'react-router';
import type { CartItem } from './Cart';
export default function CartPage() {
    const { cartItems, setCartItems } = useOutletContext<{
        cartItems: CartItem[];
        setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
    }>();

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const updateQuantity = (id: number, delta: number) => {
        setCartItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    const removeItem = (id: number) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div className='max-w-screen-xl mx-auto py-20 px-4 text-black mt-40'>
            <h2 className='text-3xl text-center font-semibold text-pink-600 mb-10'>
                🛍️ Giỏ Hàng
            </h2>

            <table className='w-full text-left border-collapse'>
                <thead className='border-b border-gray-300 text-sm text-gray-500'>
                    <tr>
                        <th className='pb-2'>Tên sản phẩm</th>
                        <th className='pb-2'>Loại hoa</th>
                        <th className='pb-2 text-center'>Số lượng</th>
                        <th className='pb-2 text-right'>Giá sản phẩm</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map(item => (
                        <tr key={item.id} className='border-b border-gray-200'>
                            <td className='py-4 flex items-center gap-4'>
                                <img src={item.image} className='w-16 h-16 object-cover rounded' />
                                <div>
                                    <p className='font-medium text-black'>{item.name}</p>
                                    <p className='text-xs text-gray-400'>SKU: HT{item.id}</p>
                                </div>
                            </td>
                            <td className='text-sm'>Hoa Sinh Nhật Em Gái</td>
                            <td>
                                <div className='flex items-center justify-center'>
                                    <button
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className='w-6 h-6 rounded-full border text-sm text-gray-600 hover:bg-gray-100'
                                    >
                                        –
                                    </button>
                                    <span className='px-3'>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className='w-6 h-6 rounded-full border text-sm text-gray-600 hover:bg-gray-100'
                                    >
                                        +
                                    </button>
                                </div>
                            </td>
                            <td className='text-right font-semibold text-pink-600'>
                                {(item.price * item.quantity).toLocaleString()} VNĐ
                            </td>
                            <td>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className='text-gray-400 hover:text-red-500 text-lg font-bold'
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className='flex justify-between mt-8 items-center'>
                <div className='flex gap-2 items-center'>
                    <span className='text-sm font-medium'>Mã khuyến mãi:</span>
                    <input
                        type='text'
                        placeholder='Nhập mã khuyến mãi'
                        className='border rounded px-4 py-1 text-sm'
                    />
                    <button className='px-3 py-1 rounded border border-pink-500 text-pink-600 text-sm'>
                        Xác nhận
                    </button>
                </div>

                <div className='text-right'>
                    <p className='text-sm'>Tổng tiền</p>
                    <p className='text-2xl font-bold text-pink-600'>
                        {totalPrice.toLocaleString()} VNĐ
                    </p>
                </div>
            </div>

            <div className='mt-6 flex justify-between'>
                <button className='px-5 py-2 border border-pink-500 text-pink-600 rounded-full text-sm hover:bg-pink-50'>
                    <Link to={`/home`}>Tiếp tục mua sắm</Link>
                </button>
                <button className='px-5 py-2 bg-pink-500 text-white rounded-full text-sm hover:bg-pink-600'>
                    Tiếp tục thanh toán
                </button>
            </div>
        </div>
    );
}
