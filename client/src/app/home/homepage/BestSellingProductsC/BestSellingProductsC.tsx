import { useEffect, useState } from "react";
import hoa1 from "../../../../assets/hoa2.webp"

function BestSellingProductsC() {
    const calculateTimeLeft = () => {
        const difference = +new Date("2025-12-31") - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                Days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                Hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                Minutes: Math.floor((difference / 1000 / 60) % 60),
                Seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="max-w-screen-xl mx-auto py-12 px-4 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
                <img src={hoa1} alt="Hot Deal" className="w-full" />
            </div>

            <div className="flex-1 text-black">
                <h2 className="text-2xl font-semibold mb-2">Best Selling Products</h2>
                <hr className="mb-4" />
                <h3 className="text-[#B9205A] text-3xl italic mb-2">Hungry Up!</h3>
                <h1 className="text-4xl font-bold mb-4">
                    Hot Deal! Sale Up To <span className="text-[#FF3C2D]">20% Off</span>
                </h1>
                <p className="text-gray-600 mb-6">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>

                <div className="flex space-x-4 mb-6">
                    {Object.entries(timeLeft).map(([label, value], idx) => (
                        <div
                            key={idx}
                            className="w-20 h-20 border rounded flex flex-col items-center justify-center"
                        >
                            <span className="text-xl font-bold">{value}</span>
                            <span className="text-xs">{label}</span>
                        </div>
                    ))}
                </div>

                <button className="bg-[#FF3C2D] text-white px-6 py-3 rounded hover:bg-[#e62c1c]">
                    SHOP NOW
                </button>
            </div>
        </div>
    );
}

export default BestSellingProductsC;
