import { useState } from 'react';
import Pagination from '~/components/Pagination';

const Playground = () => {
  const [page, setPage] = useState(1);

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold mb-8'>Pagination Component</h1>
        <p className='mb-4'>Current Page: {page}</p>
        <Pagination page={page} setPage={setPage} totalPages={20} />
      </div>
    </div>
  );
};
export default Playground;
