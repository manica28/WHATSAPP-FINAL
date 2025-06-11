
import {showLoginPage,currentUser} from "./main";

export function handleLogout() {
    localStorage.removeItem('whatsapp_token');
    localStorage.removeItem('whatsapp_user_id');
    // currentUser = null;
    showLoginPage();
}