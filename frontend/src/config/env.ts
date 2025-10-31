export const Env = {
    api_base_url: `${import.meta.env.VITE_API_ENDPOINT}`,

    base_url: '/',

    axiosHeader: {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    },

    axiosAuthHeader: {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        }
    }
}