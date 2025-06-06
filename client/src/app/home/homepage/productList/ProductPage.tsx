import { FaTwitter, FaFacebookF, FaGoogle, FaPinterestP } from "react-icons/fa";
import hoa from "../../../../assets/hoa1.webp"
import hoa1 from "../../../../assets/hoa2.webp"

const socialButtons = [
    { name: "Twitter", icon: <FaTwitter />, class: "bg-blue-400" },
    { name: "Facebook", icon: <FaFacebookF />, class: "bg-blue-600" },
    { name: "Google", icon: <FaGoogle />, class: "bg-red-500" },
    { name: "Pinterest", icon: <FaPinterestP />, class: "bg-red-600" },
];

const sizes = ["XL", "ML", "XS"];
const colors = ["bg-orange-500", "bg-yellow-500", "bg-purple-700"];
const materials = ["PARTEK", "WOOD", "GLASS"];
const relatedProducts = [
    { id: 1, price: 80 },
    { id: 2, price: 100, oldPrice: 120 },
    { id: 3, price: 30 },
];

const ProductPage = () => {
    return (
        <div className="container mx-auto px-4 py-8 pt-[200px]">
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="w-full lg:w-1/2">
                    <img
                        src={hoa}
                        alt="Main flower"
                        className="w-full rounded-lg shadow"
                    />
                    <div className="flex gap-4 mt-4">
                        {["thumb1.jpg", "thumb2.jpg", "thumb3.jpg", "thumb4.jpg"].map((img, index) => (
                            <img
                                key={index}
                                src={hoa1}
                                alt=""
                                className={`w-16 h-16 rounded ${index === 0 ? "border-2 border-red-500" : ""}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="w-full lg:w-1/2 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700">Dutchman's Breeches</h2>
                    <p className="text-lg font-bold text-red-600">
                        $130.00 <span className="line-through text-gray-400 ml-2">$150.00</span>
                    </p>
                    <p className="text-sm text-gray-500">Save: 13%</p>
                    <p className="text-sm text-gray-600">
                        There are many variations of passages of Lorem Ipsum available...
                    </p>

                    <div className="text-black">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                        <div className="flex gap-2">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    className="px-3 py-1 border rounded hover:bg-gray-100"
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <div className="flex gap-2">
                            {colors.map((color, index) => (
                                <span
                                    key={index}
                                    className={`w-6 h-6 ${color} rounded-full border-2 border-black`}
                                ></span>
                            ))}
                        </div>
                    </div>

                    <div className="text-black">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                        <div className="flex gap-3 text-sm">
                            {materials.map((material, index) => (
                                <span key={index}>{material}</span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-black">
                        <input
                            type="number"
                            min="1"
                            defaultValue="1"
                            className="w-16 border rounded px-2 py-1"
                        />
                        <button className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-700">
                            Add to cart
                        </button>
                    </div>

                    <button className="bg-yellow-500 text-black px-6 py-2 mt-4 rounded hover:bg-yellow-600 w-full">
                        BUY IT NOW
                    </button>

                    <div className="mt-4 space-y-2 text-sm text-gray-500">
                        <p>Category: Best Selling Greens Hot Flower</p>
                        <p>Tags: black, brown, cyan</p>
                        <div className="flex gap-3 mt-2">
                            {socialButtons.map((social, i) => (
                                <button
                                    key={i}
                                    className={`px-3 py-1 rounded text-white flex items-center gap-2 ${social.class}`}
                                >
                                    {social.icon} {social.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-black">
                <h3 className="text-lg font-semibold mb-4">Pair it with</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {relatedProducts.map((product) => (
                        <div key={product.id} className="text-center shadow-2xs">
                            <img
                                src={hoa1}
                                className="mx-auto mb-10 rounded shadow h-71"
                                alt="related"
                            />
                            <p className="text-sm">Pearly Everlasting</p>
                            {product.oldPrice ? (
                                <>
                                    <p className="text-sm font-bold text-red-500 line-through">
                                        ${product.oldPrice}.00
                                    </p>
                                    <p className="text-sm font-bold">${product.price}.00</p>
                                </>
                            ) : (
                                <p className="text-sm font-bold">${product.price}.00</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductPage;