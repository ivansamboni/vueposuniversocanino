import { defineStore } from 'pinia';
import axiosInst from '@/components/axiosins'

const url = import.meta.env.VITE_APP_API_URL;

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    // initialize state from local storage to enable user to stay logged in
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    user: JSON.parse(localStorage.getItem('user')),   

    returnUrl: null
  }),
  actions: {
    async login(email: string, password: string) {
     //await axiosInst.get(url + 'sanctum/csrf-cookie');
      const resUser = await axiosInst.post(url + 'api/login', { email, password })      
      // update pinia state
      this.user = resUser.data;  

      // store user details and jwt in local storage to keep user logged in between page refreshes
      localStorage.setItem('user', JSON.stringify(resUser.data));
      // redirect to previous url or default to home page
      window.location.href = '/vender';      
    },
    async logout() {
      try {
        const res = await axiosInst.post(url + 'api/logout')
        this.user = null;
        localStorage.removeItem('user');
        localStorage.removeItem('listaProductos');
        window.location.href = '/auth/login';     
      }catch(err){
        localStorage.removeItem('user');
        localStorage.removeItem('listaProductos');
        window.location.href = '/auth/login';     
      }       
    }
  }
});
