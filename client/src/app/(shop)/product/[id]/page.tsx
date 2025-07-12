import React from 'react';
import { useParams } from 'react-router';

const Page = () => {
  const { id } = useParams();
  return <div>Page</div>;
};

export default Page;
