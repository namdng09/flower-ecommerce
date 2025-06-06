import pic from "../../../../assets/about-us.webp"

const PhulerIntro = () => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto p-8 min-h-screen bg-white text-gray-800">

            <div className="md:w-1/2 space-y-6">
                <h1 className="text-4xl font-bold">
                    Welcome To <span className="text-red-600">Phuler</span> Store<span className="text-black">!</span>
                </h1>
                <div className="w-16 h-1 bg-red-600"></div>
                <p className="font-semibold">
                    Phuler Shop is a premium HTML template designed and developed from the ground up with the sole purpose of helping you create an astonishing, the beautiful and user friendly website that will boost your product’s sales.
                </p>
                <p>
                    The theme design package provides a complete Magento theme set for your online store according to your desired theme. This includes all Magento themes that are required for your online store’s successful implementation.
                </p>
                <button className="bg-red-600 text-white font-bold px-6 py-3 rounded hover:bg-red-700 transition duration-300">
                    SHOP NOW!
                </button>
            </div>

            <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
                <img
                    src={pic}
                    alt="Flower Decoration"
                    className="w-full max-w-md rounded-lg shadow-lg"
                />
            </div>
        </div>
    );
};

export default PhulerIntro;
