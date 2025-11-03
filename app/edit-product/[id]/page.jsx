'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/ProductForm';

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id; // dynamic route param

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start pt-10">
      <ProductForm mode="edit" productId={productId} />
    </div>
  );
}
