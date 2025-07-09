import { useParams } from 'react-router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '~/hooks/useAppSelector';
import { fetchProductsByShop } from '~/store/slices/productSlice';
import { Link } from 'react-router';
import {
    FaEnvelope,
    FaPhoneAlt,
    FaUserCircle,
    FaStore,
    FaShoppingBag,
} from 'react-icons/fa';

const ShopProfilePage = () => {
    const { shopId } = useParams();
    const dispatch = useDispatch<any>();

    const { shopProducts, shopInfo, loading, error } = useAppSelector(
        state => state.products
    );

    useEffect(() => {
        if (shopId) {
            dispatch(fetchProductsByShop(shopId));
        }
    }, [dispatch, shopId]);

    if (loading)
        return <div className="pt-[200px] text-center">Đang tải dữ liệu shop...</div>;

    if (error)
        return (
            <div className="pt-[200px] text-center text-red-600">
                ❌ {error}
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 text-black mt-40">
            {shopInfo && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-10 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-20 h-20 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-4xl shadow-inner">
                        <FaStore />
                    </div>

                    <div className="flex-1 space-y-1">
                        <h2 className="text-xl font-bold text-pink-700 flex items-center gap-2">
                            <FaUserCircle className="text-gray-500" />
                            {shopInfo.fullName} ({shopInfo.username})
                        </h2>
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                            <FaPhoneAlt className="text-gray-500" /> {shopInfo.phoneNumber}
                        </p>
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                            <FaEnvelope className="text-gray-500" /> {shopInfo.email}
                        </p>
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-lg font-semibold mb-4 text-pink-600 flex items-center gap-2">
                    <FaShoppingBag className="text-pink-600" />
                    Sản phẩm đang bán ({shopProducts.length})
                </h3>

                {shopProducts.length === 0 ? (
                    <p className="text-gray-500 italic">Shop hiện chưa có sản phẩm nào.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {shopProducts.map(product => (
                            <Link
                                to={`/home/products/${product._id}`}
                                key={product._id}
                                className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col group"
                            >
                                <img
                                    src={product.thumbnailImage}
                                    alt={product.title}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition"
                                />
                                <div className="p-3 flex-1 flex flex-col justify-between">
                                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                                        {product.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                        {product.description.replace(/"/g, '')}
                                    </p>
                                    <span className="text-[13px] text-pink-600 font-medium">
                                        ➤ Xem chi tiết
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopProfilePage;
