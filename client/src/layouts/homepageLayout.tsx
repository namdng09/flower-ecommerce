import { Outlet } from 'react-router';
import HeaderC from '../app/home/homepage/header/HeaderC';
import FooterC from '../app/home/homepage/footer/FooterC';

const homepageLayout = () => {
    return (
        <div className="bg-white min-h-screen flex flex-col">
            <HeaderC />

            <main className="flex justify-center items-center flex-1 mx-auto">
                <Outlet />
            </main>

            <FooterC />
        </div>
    );
};

export default homepageLayout;
