import { defineStore } from 'pinia';
import productsData from '~/products.json';
import type { Product, ProductFilters } from '~/types/product';

export const useProductsStore = defineStore('products', {
    state: () => ({
        products: [] as Product[],
        isLoading: false,
        error: null as string | null,
        filters: {
            dateFrom: '',
            dateTo: '',
            categories: [] as string[],
            status: ''
        } as ProductFilters
    }),

    getters: {
        getAllProducts: (state): Product[] => state.products,

        getUniqueCategories: (state): string[] => {
            const categories = new Set<string>();
            state.products.forEach(product => {
                categories.add(product.category);
            });
            return Array.from(categories);
        },

        getFilteredProducts: (state): Product[] => {
            return state.products.filter(product => {
                if (state.filters.dateFrom || state.filters.dateTo) {
                    const productDate = parseDate(product.date_created);

                    if (state.filters.dateFrom) {
                        const fromDate = new Date(state.filters.dateFrom);
                        if (productDate < fromDate) return false;
                    }

                    if (state.filters.dateTo) {
                        const toDate = new Date(state.filters.dateTo);
                        toDate.setHours(23, 59, 59); // Конец дня
                        if (productDate > toDate) return false;
                    }
                }

                if (state.filters.categories.length > 0) {
                    if (!state.filters.categories.includes(product.category)) return false;
                }

                if (state.filters.status && product.status !== state.filters.status) {
                    return false;
                }

                return true;
            });
        }
    },

    actions: {
        async fetchProducts() {
            this.isLoading = true;
            this.error = null;

            try {
                // Имитация задержки API запроса
                await new Promise(resolve => setTimeout(resolve, 300));

                this.products = productsData as Product[];
            } catch (error) {
                this.error = 'Ошибка при загрузке товаров';
                console.error('Ошибка при загрузке товаров:', error);
            } finally {
                this.isLoading = false;
            }
        },

        updateFilters(filters: ProductFilters) {
            this.filters = { ...filters };
        },

        resetFilters() {
            this.filters = {
                dateFrom: '',
                dateTo: '',
                categories: [],
                status: ''
            };
        }
    }
});

function parseDate(dateString: string): Date {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('.');
    const [hours, minutes, seconds] = timePart.split(':');

    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day),
        parseInt(hours), parseInt(minutes), parseInt(seconds));
}