import logo from '../../../../assets/logo1.svg';
import { Link } from 'react-router';

const footerItems = [
    {
        title: 'Resources',
        links: [
            { label: 'Flowbite', href: 'https://flowbite.com/' },
            { label: 'Tailwind CSS', href: 'https://tailwindcss.com/' }
        ],
        type: 'external'
    },
    {
        title: 'Follow us',
        links: [
            { label: 'Github', href: 'https://github.com/themesberg/flowbite' },
            { label: 'Discord', href: 'https://discord.gg/4eeurUVvTy' }
        ],
        type: 'external'
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms & Conditions', href: '#' }
        ],
        type: 'external'
    }
];

function FooterC() {
    return (
        <div>
            <footer className='bg-[#F8F5F2]'>
                <div className='mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8'>
                    <div className='md:flex md:justify-between'>
                        <div className='mb-5 md:mb-0'>
                            <a href='/' className='flex items-center'>
                                <img src={logo} className='h-40 me-3' alt='RibbonBox Logo' />
                                <span className='self-center text-2xl font-semibold whitespace-nowrap text-[#AD3542]'>
                                    Flaura
                                </span>
                            </a>
                        </div>

                        <div className='grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-4'>
                            {footerItems.map(section => (
                                <div key={section.title}>
                                    <h2 className='mb-6 text-sm font-semibold text-[#AD3542] uppercase'>
                                        {section.title}
                                    </h2>
                                    <ul className='text-[#AD3542] font-medium space-y-2'>
                                        {section.links.map(item =>
                                            section.type === 'internal' ? (
                                                <li key={item?.to}>
                                                    <Link
                                                        to={item?.to}
                                                        className='hover:text-[#C25C61] transition'
                                                    >
                                                        {item.label}
                                                    </Link>
                                                </li>
                                            ) : (
                                                <li key={item.href}>
                                                    <a
                                                        href={item.href}
                                                        className='hover:text-[#C25C61] transition'
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                    >
                                                        {item.label}
                                                    </a>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <hr className='my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8' />

                    <div className='sm:flex sm:items-center sm:justify-between'>
                        <span className='text-sm text-[#AD3542] sm:text-center'>
                            © 2025{' '}
                            <a href='/' className='hover:text-[#C25C61]'>
                                Flaura™
                            </a>
                            . All Rights Reserved.
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default FooterC;
