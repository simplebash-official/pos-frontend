import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Badge } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { DataTable, Column } from '@/shared/components/DataTable';
import { Product } from '../types';
import { formatMoney } from '@/shared/lib/money';

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'USB-C Fast Charger Cable (2m)',
    sku: 'ACC-001',
    barcode: '8901234567890',
    category: 'Accessories',
    costPriceCents: 45000,
    sellingPriceCents: 120000,
    stockQuantity: 45,
    minStockThreshold: 10,
  },
  {
    id: '2',
    name: 'Tempered Glass Screen Guard (Universal)',
    sku: 'ACC-002',
    barcode: '8901234567891',
    category: 'Accessories',
    costPriceCents: 15000,
    sellingPriceCents: 65000,
    stockQuantity: 5,
    minStockThreshold: 15,
  },
];

export function ProductTable() {
  const columns: Column<Product>[] = [
    {
      key: 'sku',
      header: 'SKU',
      render: (product) => <strong>{product.sku}</strong>,
    },
    {
      key: 'name',
      header: 'Product Name',
      render: (product) => product.name,
    },
    {
      key: 'category',
      header: 'Category',
      render: (product) => product.category,
    },
    {
      key: 'sellingPriceCents',
      header: 'Selling Price',
      align: 'right',
      render: (product) => formatMoney(product.sellingPriceCents),
    },
    {
      key: 'stockQuantity',
      header: 'Stock Level',
      align: 'center',
      render: (product) => {
        const isLow = product.stockQuantity <= product.minStockThreshold;
        return (
          <Badge color={isLow ? 'red' : 'green'} variant="light">
            {product.stockQuantity} units {isLow ? '(Low Stock)' : ''}
          </Badge>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Inventory & Stock Management"
        description="Unified stock level catalog across retail items, repair parts, and print raw materials"
        action={
          <Button leftSection={<IconPlus size={16} />} color="blue">
            Add Product / Material
          </Button>
        }
      />

      <DataTable
        data={SAMPLE_PRODUCTS}
        columns={columns}
        keyExtractor={(p) => p.id}
        emptyText="No inventory products added"
      />
    </div>
  );
}
