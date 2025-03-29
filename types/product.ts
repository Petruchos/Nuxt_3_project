// Интерфейс для определения структуры продукта
export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    rating: number;
    status: 'active' | 'limited';
    date_created: string;
}

// Интерфейс для фильтров продуктов
export interface ProductFilters {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    status: string;
}