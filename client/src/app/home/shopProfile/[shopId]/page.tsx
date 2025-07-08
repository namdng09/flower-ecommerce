import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import axiosInstance from '~/config/axiosConfig';
import { Link } from 'react-router';

const Page = () => {
    const { shopId } = useParams();
    const [products, setProducts] = useState([]);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShopProducts = async () => {
            try {
                const res = await axiosInstance.get(`/api/products/shop/${shopId}`);
                setProducts(res.data.data || []);
                setShop(res.data.shop);
            } catch (error) {
                console.error('Lỗi khi tải sản phẩm shop:', error);
            } finally {
                setLoading(false);
            }
        };
        if (shopId) fetchShopProducts();
    }, [shopId]);

    if (loading) return <div className="pt-[200px] text-center">Đang tải dữ liệu shop...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 text-black mt-40">
            <h2 className="text-2xl font-bold mb-4">🛍 Sản phẩm của shop</h2>
            {shop && (
                <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
                    <p><strong>Tên shop:</strong> {shop.fullName} ({shop.username})</p>
                    <p><strong>Liên hệ:</strong> {shop.phoneNumber} - {shop.email}</p>
                </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                    <Link
                        to={`/home/products/${product._id}`}
                        key={product._id}
                        className="border rounded shadow hover:shadow-lg bg-white overflow-hidden"
                    >
                        <img
                            src={product.thumbnailImage}
                            alt={product.title}
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-3">
                            <h3 className="text-sm font-semibold line-clamp-1">{product.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Page;
