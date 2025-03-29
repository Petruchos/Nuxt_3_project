<template>
  <ClientOnly>
    <div class="account-page">
      <header class="navbar">
        <div class="container navbar__container">
          <div class="navbar__logo">
            <span>Админ</span>Панель
          </div>
          <div v-if="authStore.getUser">
            <span class="user-info">
              {{ authStore.getUser.name }} {{ authStore.getUser.surname }}
            </span>
            <button @click="logout" class="btn btn-outline">Выход</button>
          </div>
        </div>
      </header>

      <div class="container py-4">
        <h1 class="mb-4">Управление товарами</h1>

        <!-- Состояние загрузки -->
        <div v-if="productsStore.isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Загрузка данных...</p>
        </div>

        <!-- Сообщение об ошибке -->
        <div v-else-if="productsStore.error" class="error-state">
          <p>{{ productsStore.error }}</p>
          <button @click="productsStore.fetchProducts()" class="btn btn-primary mt-2">
            Попробовать снова
          </button>
        </div>

        <div v-else>
          <!-- Фильтры -->
          <div class="filters card mb-4">
            <div class="card__header collapsible-header" @click="toggleFilters">
              <div class="header-content">
                <h2>Фильтры</h2>
                <div class="toggle-icon" :class="{ 'rotated': isFiltersOpen }">
                  <span class="icon">▼</span>
                </div>
              </div>
              <div v-if="hasActiveFilters" class="active-filters-badge">
                Фильтры активны
              </div>
            </div>
            <div class="card__body" v-show="isFiltersOpen">
              <div class="filters-grid">
                <!-- Фильтр по дате создания -->
                <div class="form-group">
                  <label>Дата создания</label>
                  <div class="date-range">
                    <input
                        type="date"
                        v-model="filters.dateFrom"
                        placeholder="От"
                        @change="applyFilters"
                        class="form-control"
                    >
                    <input
                        type="date"
                        v-model="filters.dateTo"
                        placeholder="До"
                        @change="applyFilters"
                        class="form-control"
                    >
                  </div>
                </div>

                <!-- Фильтр по категории -->
                <div class="form-group">
                  <label>Категория</label>
                  <div class="categories">
                    <div
                        v-for="category in productsStore.getUniqueCategories"
                        :key="category"
                        class="category-checkbox"
                    >
                      <input
                          type="checkbox"
                          :id="'cat-' + category"
                          :value="category"
                          v-model="filters.categories"
                          @change="applyFilters"
                      >
                      <label :for="'cat-' + category">{{ category }}</label>
                    </div>
                  </div>
                </div>

                <!-- Фильтр по статусу -->
                <div class="form-group">
                  <label>Статус</label>
                  <select v-model="filters.status" @change="applyFilters" class="form-control">
                    <option value="">Все</option>
                    <option value="active">Активный</option>
                    <option value="limited">Ограниченный</option>
                  </select>
                </div>
              </div>

              <div class="filter-actions">
                <button @click="resetFilters" class="btn btn-text">Сбросить фильтры</button>
              </div>
            </div>
          </div>

          <!-- Таблица товаров -->
          <div class="data-table card">
            <div class="card__header">
              <div class="table-header">
                <h2>Список товаров</h2>
                <div class="badge badge-info">Найдено: {{ productsStore.getFilteredProducts.length }}</div>
              </div>
            </div>
            <div class="card__body">
              <table class="data-table">
                <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>Наличие</th>
                  <th>Статус</th>
                  <th>Дата создания</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="product in productsStore.getFilteredProducts" :key="product.id">
                  <td>{{ product.id }}</td>
                  <td>{{ product.name }}</td>
                  <td>{{ product.category }}</td>
                  <td>{{ product.price.toLocaleString() }} ₽</td>
                  <td>{{ product.stock }}</td>
                  <td>
                      <span
                          class="status-badge"
                          :class="{ 'active': product.status === 'active', 'limited': product.status === 'limited' }"
                      >
                        {{ product.status === 'active' ? 'Активен' : 'Ограничен' }}
                      </span>
                  </td>
                  <td>{{ product.date_created }}</td>
                </tr>
                <tr v-if="productsStore.getFilteredProducts.length === 0">
                  <td colspan="7" class="text-center py-3">Товары не найдены</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #fallback>
      <div class="account-page">
        <header class="navbar">
          <div class="container navbar__container">
            <div class="navbar__logo">
              <span>Админ</span>Панель
            </div>
          </div>
        </header>
        <div class="container py-4">
          <h1 class="mb-4">Управление товарами</h1>
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Загрузка интерфейса...</p>
          </div>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useProductsStore } from '~/stores/products';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const productsStore = useProductsStore();

const isFiltersOpen = ref(false);

const filters = reactive({
  dateFrom: '',
  dateTo: '',
  categories: [],
  status: ''
});

const hasActiveFilters = computed(() => {
  return filters.dateFrom !== '' ||
      filters.dateTo !== '' ||
      filters.categories.length > 0 ||
      filters.status !== '';
});

function toggleFilters() {
  isFiltersOpen.value = !isFiltersOpen.value;
}

onMounted(async () => {
  await authStore.checkAuth();

  if (!authStore.isAuthenticated) {
    router.push('/');
    return;
  }

  await productsStore.fetchProducts();

  Object.assign(filters, productsStore.filters);

  if (hasActiveFilters.value) {
    isFiltersOpen.value = true;
  }
});

watch(
    () => productsStore.filters,
    (newFilters) => {
      Object.assign(filters, newFilters);
    },
    { deep: true }
);

function applyFilters() {
  productsStore.updateFilters({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    categories: [...filters.categories],
    status: filters.status
  });
}

function resetFilters() {
  productsStore.resetFilters();
  // Синхронизируем локальные фильтры
  Object.assign(filters, productsStore.filters);
}

function logout() {
  authStore.logout();
  router.push('/');
}
</script>

<style scoped>
.account-page {
  min-height: 100vh;
  padding-bottom: 3rem;
  background-color: var(--black);
}

.user-info {
  margin-right: 1rem;
  color: var(--white);
}

.loading-state,
.error-state {
  text-align: center;
  padding: 2rem;
  background-color: var(--gray-dark);
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 1rem;
  border: 4px solid rgba(var(--primary-rgb), 0.25);
  border-top-color: var(--primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p,
.error-state p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--gray);
}

th {
  font-weight: 600;
  color: var(--white);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.date-range {
  display: flex;
  gap: 0.5rem;
}

.date-range input {
  flex: 1;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.status-badge.active {
  background-color: var(--success);
  color: var(--white);
}

.status-badge.limited {
  background-color: var(--warning);
  color: var(--black);
}

.form-control {
  background-color: var(--gray-dark);
  border: 1px solid var(--gray);
  color: var(--white);
  border-radius: 4px;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.3);
  outline: none;
}

.collapsible-header {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.collapsible-header:hover {
  background-color: rgba(var(--primary-rgb), 0.1);
}

.header-content {
  display: flex;
  align-items: center;
}

.toggle-icon {
  margin-left: 0.75rem;
  transition: transform 0.3s ease;
  color: var(--primary);
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.active-filters-badge {
  background-color: var(--primary);
  color: var(--white);
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(138, 43, 226, 0.3);
}

.category-checkbox {
  display: flex;
  align-items: center;
  margin-right: 1rem;
  margin-bottom: 0.5rem;
}

.category-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.category-checkbox label {
  position: relative;
  padding-left: 2rem;
  cursor: pointer;
  user-select: none;
  display: inline-block;
  line-height: 20px;
  transition: color 0.3s ease;
}

.category-checkbox label:hover {
  color: var(--primary-light);
}

.category-checkbox label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 18px;
  height: 18px;
  border: 2px solid var(--gray);
  border-radius: 4px;
  background-color: var(--gray-dark);
  transition: all 0.2s ease;
}

.category-checkbox input[type="checkbox"]:checked + label::before {
  background-color: var(--primary);
  border-color: var(--primary);
}

.category-checkbox input[type="checkbox"]:checked + label::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 3px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.category-checkbox input[type="checkbox"]:focus + label::before {
  box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.3);
}

.category-checkbox input[type="checkbox"]:checked + label {
  color: var(--primary);
}
</style>