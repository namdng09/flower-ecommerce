import { Link } from "react-router";
import logo1 from "../../../../assets/logo1.svg";
import { FiShoppingBag } from "react-icons/fi";

const navItems = [
    { label: "Trang Chủ", path: "/home" },
    { label: "Cửa Hàng", path: "/home/shop" },
    { label: "Sản Phẩm", path: "/products" },
    { label: "BLOG", path: "/blog" },
    { label: "Về Chúng Tôi", path: "/about" },
    { label: "Liên Hệ", path: "/contact" },
];

function HeaderC() {
    return (
        <div>
            <nav className='bg-[#FFFDFA] fixed w-full z-20 top-0 start-0 border-b border-[#F8F5F2]'>
                <div className='max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4'>
                    <a href='/home' className='flex items-center space-x-3 rtl:space-x-reverse'>
                        <img src={logo1} alt="Ribbon Box Logo" className="h-35" />
                    </a>

                    <div className='items-center justify-between hidden w-full md:flex md:w-auto md:order-1' id='navbar-sticky'>
                        <ul className='flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-[#FFFDFA]'>
                            {navItems.map((item, idx) => (
                                <li key={idx}>
                                    <Link
                                        to={item.path}
                                        className='block py-2 px-3 text-[#2C2C2C] hover:text-[#B9205A] md:p-0'
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className='flex items-center space-x-6 md:order-2'>
                        <div className='flex items-center space-x-2 cursor-pointer'>
                            <FiShoppingBag className='text-2xl text-gray-800' />
                            <div className='relative'>
                                <span className='absolute -top-3 -right-3 bg-red-500 text-white text-xs rounded-full px-1'>
                                    0
                                </span>
                            </div>
                            <div className='flex flex-col text-sm text-gray-800'>
                                <span>My Cart</span>
                                <span>$0.00</span>
                            </div>
                        </div>
                        <button
                            type='button'
                            className='text-white bg-[#B9205A] hover:bg-[#F8C8D2] focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-lg text-lg px-4 py-2 text-center'
                        >
                            Bắt đầu mua sắm
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default HeaderC;
