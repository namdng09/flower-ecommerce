import { Link } from 'react-router';
import pic from '../../../src/assets/about-us.webp';

const PhulerIntro = () => {
  return (
    <div className='flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto p-8 min-h-screen bg-white text-gray-800 mt-15'>
      <div className='md:w-1/2 space-y-6'>
        <h1 className='text-4xl font-bold'>
          Welcome To <span className='text-red-600'>Flora</span> Store
          <span className='text-black'>!</span>
        </h1>
        <div className='w-16 h-1 bg-red-600'></div>
        <div className='space-y-4'>
          <p className='font-semibold text-gray-800 text-lg leading-relaxed'>
            Flaura là sàn thương mại điện tử chuyên về lĩnh vực hoa tươi và quà
            tặng, nơi kết nối các cửa hàng hoa uy tín và người yêu hoa trên toàn
            quốc. Chúng tôi mang đến một nền tảng mua sắm trực tuyến tiện lợi,
            hiện đại, giúp khách hàng dễ dàng lựa chọn và đặt mua những bó hoa,
            giỏ hoa hay hộp quà tặng ý nghĩa cho mọi dịp đặc biệt như sinh nhật,
            lễ kỷ niệm, ngày cưới, ngày lễ tình nhân hay đơn giản là để gửi gắm
            yêu thương hằng ngày.
          </p>
          <p className='text-gray-700 leading-relaxed'>
            Với giao diện thân thiện, dễ sử dụng và hệ thống phân loại sản phẩm
            rõ ràng, Flaura giúp người dùng nhanh chóng tìm được sản phẩm phù
            hợp với nhu cầu và mức giá mong muốn. Ngoài ra, Flaura còn hỗ trợ
            các nhà bán hàng quản lý cửa hàng trực tuyến, cập nhật sản phẩm và
            tiếp cận khách hàng một cách hiệu quả.
          </p>
          <p className='text-gray-700 leading-relaxed'>
            Chúng tôi cam kết mang đến trải nghiệm mua sắm an toàn, dịch vụ giao
            hàng nhanh chóng và chất lượng sản phẩm tốt nhất để mỗi bó hoa đến
            tay người nhận đều trọn vẹn ý nghĩa và cảm xúc.
          </p>
        </div>

        <button className='bg-red-600 text-white font-bold px-6 py-3 rounded hover:bg-red-700 transition duration-300'>
          <Link to={`/home/shop`}>SHOP NOW!</Link>
        </button>
      </div>

      <div className='md:w-1/2 mt-10 md:mt-0 flex justify-center'>
        <img
          src={pic}
          alt='Flower Decoration'
          className='w-full max-w-md rounded-lg shadow-lg'
        />
      </div>
    </div>
  );
};

export default PhulerIntro;
