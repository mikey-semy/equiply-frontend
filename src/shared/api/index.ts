import api from './api';
export default api;

// Теперь импортируем из локального файла, а не из @/utils
export {
    handleApiError,
    handleApiResponse
} from './api.handlers';
