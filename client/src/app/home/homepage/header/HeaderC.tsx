import logo1 from "../../../../assets/logo1.svg"

function HeaderC() {
    return (
        <div>
            <nav className='bg-[#FFFDFA] fixed w-full z-20 top-0 start-0 border-b border-[#F8F5F2]'>
                <div className='max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4'>
                    <a
                        href={"/home"}
                        className='flex items-center space-x-3 rtl:space-x-reverse'
                    >
                        <img
                            src={logo1}
                            className='h-38'
                            alt='Flowbite Logo'
                        />
                    </a>
                    <div className='flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse'>
                        <button
                            type='button'
                            className='text-white bg-[#B9205A] hover:bg-[#F8C8D2] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg px-4 py-2 text-center'
                        >
                            Bắt đầu mua sắm
                        </button>
                    </div>
                    <div
                        className='items-center justify-between hidden w-full md:flex md:w-auto md:order-1'
                        id='navbar-sticky'
                    >
                        <ul className='flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-[#FFFDFA]'>
                            <li>
                                <a
                                    href='#'
                                    className='block py-2 px-3 text-[#B9205A] bg-[#B9205A] rounded-sm md:bg-transparent md:text-[#B9205A] md:p-0 md:dark:text-[#B9205A  ]'
                                    aria-current='page'
                                >
                                    Home
                                </a>
                            </li>
                            <li>
                                <a
                                    href='#'
                                    className='block py-2 px-3 text-[#B9205A] bg-[#B9205A] rounded-sm md:bg-transparent md:text-[#B9205A] md:p-0 md:dark:text-[#B9205A  ]'
                                    aria-current='page'
                                >
                                    Services
                                </a>
                            </li>
                            <li>
                                <a
                                    href='#'
                                    className='block py-2 px-3 text-[#B9205A] bg-[#B9205A] rounded-sm md:bg-transparent md:text-[#B9205A] md:p-0 md:dark:text-[#B9205A  ]'
                                    aria-current='page'
                                >
                                    Contacts
                                </a>
                            </li>
                            <li>
                                <a
                                    href='#'
                                    className='block py-2 px-3 text-[#B9205A] bg-[#B9205A] rounded-sm md:bg-transparent md:text-[#B9205A] md:p-0 md:dark:text-[#B9205A  ]'
                                    aria-current='page'
                                >
                                    About
                                </a>
                            </li>

                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default HeaderC;
