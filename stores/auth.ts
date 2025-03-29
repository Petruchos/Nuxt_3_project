import { defineStore } from 'pinia';
import usersData from '~/users.json';

interface User {
    name: string;
    surname: string;
    username: string;
}

interface AuthState {
    user: User | null;
    error: string | null;
    isLoading: boolean;
}

const isBrowser = () => typeof window !== 'undefined';

function extractPasswordFromComment(comment: string): string {
    const match = comment.match(/'([^']+)'/);
    if (match && match[1]) {
        return match[1];
    }
    return '';
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        error: null,
        isLoading: false
    }),

    getters: {
        isAuthenticated: (state): boolean => !!state.user,
        getUser: (state): User | null => state.user,
        getError: (state): string | null => state.error
    },

    actions: {
        async login(username: string, password: string): Promise<boolean> {
            this.isLoading = true;
            this.error = null;

            try {
                // Имитация задержки API запроса
                await new Promise(resolve => setTimeout(resolve, 500));

                const user = usersData.find(
                    u => u.credentials.username === username
                );

                if (user && user._comment) {
                    const actualPassword = extractPasswordFromComment(user._comment);

                    if (password === actualPassword) {
                        const userData: User = {
                            name: user.name,
                            surname: user.surname,
                            username: user.credentials.username
                        };

                        this.user = userData;

                        if (isBrowser()) {
                            localStorage.setItem('user', JSON.stringify(userData));
                        }

                        return true;
                    }
                }

                this.error = 'Введены неверные данные авторизации. Попробуйте еще раз.';
                return false;
            } catch (error) {
                this.error = 'Произошла ошибка при входе. Попробуйте позже.';
                return false;
            } finally {
                this.isLoading = false;
            }
        },

        logout(): void {
            this.user = null;

            if (isBrowser()) {
                localStorage.removeItem('user');
            }
        },

        checkAuth(): void {
            if (isBrowser()) {
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    try {
                        this.user = JSON.parse(savedUser) as User;
                    } catch (e) {
                        localStorage.removeItem('user');
                    }
                }
            }
        }
    }
});

