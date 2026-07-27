import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Badge } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, Column } from '@/shared/components/DataTable';
import { Product } from '../types';
import { fetchProducts } from '../api/mockProducts';
import { queryKeys } from '@/api/queryKeys';
import { formatMoney } from '@/shared/lib/money';

export function ProductTable() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: fetchProducts,
  });

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
        data={products}
        columns={columns}
        loading={isLoading}
        keyExtractor={(p) => p.id}
        emptyText="No inventory products added"
      />
    </div>
  );
}

