<template>
  <div class="login-page">
    <div class="card">
      <div class="card__header">
        <h1>Вход в систему</h1>
      </div>
      <div class="card__body">
        <form @submit.prevent="login" class="form">
          <div class="form-group">
            <label for="username">Логин</label>
            <input
                id="username"
                v-model="username"
                type="email"
                required
                placeholder="Введите email"
                :disabled="authStore.isLoading"
            >
          </div>

          <div class="form-group">
            <label for="password">Пароль</label>
            <div class="password-input-container">
              <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="Введите пароль"
                  :disabled="authStore.isLoading"
              >
              <div class="password-toggle" @click="togglePasswordVisibility">
                <Icon
                    :name="showPassword ? 'ph:eye' : 'ph:eye-slash'"
                    size="20px"
                    class="password-icon"
                />
              </div>
            </div>
          </div>

          <div v-if="authStore.getError" class="error-message mb-3">
            {{ authStore.getError }}
          </div>

          <button
              type="submit"
              class="btn btn-primary"
              :disabled="authStore.isLoading"
          >
            <span v-if="authStore.isLoading">Вход...</span>
            <span v-else>Войти</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

let username = '';
let password = '';
let showPassword = false;
const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {

  authStore.checkAuth();

  if (authStore.isAuthenticated) {
    router.push('/account');
  }
});

function togglePasswordVisibility() {
  showPassword = !showPassword;
}

async function login() {
  const success = await authStore.login(username, password);

  if (success) {
    router.push('/account');
  }
}
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--black);
}

.card {
  width: 100%;
  max-width: 400px;
}

.error-message {
  color: var(--error);
  font-size: 0.9rem;
  padding: 0.5rem;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-container input {
  width: 100%;
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  right: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-icon {
  color: var(--gray-600);
}

.password-toggle:hover .password-icon {
  color: var(--primary);
}
</style>