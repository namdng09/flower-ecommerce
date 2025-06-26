import hoa1 from '../../../../assets/back.png';
import hoa2 from '../../../../assets/hoa2.webp';

const testimonials = [
  {
    background: hoa1,
    avatar: hoa2,
    quote:
      'This theme is so smooth, flexible, and easy to use. The support team is also very helpful whenever I need assistance.',
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
