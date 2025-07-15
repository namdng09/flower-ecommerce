import hoa1 from '../../../src/assets/back.png';
import hoa2 from '../../../src/assets/hoa1.webp';

const testimonials = [
  {
    background: hoa1,
    avatar: hoa2,
    quote:
      'Giao diện này thật mượt mà, linh hoạt và dễ sử dụng. Đội ngũ hỗ trợ cũng rất nhiệt tình mỗi khi tôi cần sự trợ giúp.',
    name: 'Minh Anh',
    theme: 'spring'
  }
];

const FeedbackC = () => {
  return (
    <div className='relative'>
      {testimonials.map((item, index) => (
        <div
          key={index}
          className='relative bg-cover bg-center py-20'
          style={{ backgroundImage: `url(${item.background})` }}
        >
          <div className='flex flex-col items-center text-center max-w-3xl mx-auto px-4'>
            <img
              src={item.avatar}
              alt='avatar'
              className='w-24 h-24 rounded-full mb-6 border-4 border-white'
            />
            <p
              className={`italic text-lg mb-4 ${
                item.theme === 'christmas' ? 'text-white' : 'text-pink-800'
              }`}
            >
              {item.quote}
            </p>
            <h4
              className={`text-xl font-bold ${
                item.theme === 'christmas' ? 'text-white' : 'text-pink-800'
              }`}
            >
              {item.name}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedbackC;
