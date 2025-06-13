// connexion.js - Gestion de l'authentification WhatsApp
import { API_BASE, showLoginPage} from "./main";
let tempPhoneNumber = '';
 let authStep = 'phone'; // 'phone' ou 'code'

// Configuration de l'API
// Vérification du statut d'authentification
export function checkAuthStatus() {
    const token = localStorage.getItem('whatsapp_token');
    const userId = localStorage.getItem('whatsapp_user_id');
    
    if (token && userId) {
        // Vérifier si la session est encore valide
        validateSession(userId);
    } else {
        showLoginPage();
    }
}

// Validation de la session
async function validateSession(userId) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`);
        if (response.ok) {
            const user = await response.json();
            // Appeler la fonction du fichier principal pour afficher l'app
            onAuthSuccess(user);
        } else {
            showLoginPage();
        }
    } catch (error) {
        console.error('Erreur de validation de session:', error);
        showLoginPage();
    }
}

// Étape 1: Saisie du numéro de téléphone
function showPhoneNumberStep() {
    document.querySelector('#app').innerHTML = `
        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
            <div class="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                <div class="text-center mb-8">
                    <i class="fab fa-whatsapp text-6xl text-green-500 mb-4"></i>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">WhatsApp Web</h1>
                    <p class="text-gray-600">Vérifiez votre numéro de téléphone</p>
                </div>
                
                <div class="mb-6">
                    <p class="text-sm text-gray-600 text-center mb-4">
                        WhatsApp vous enverra un code de vérification par SMS à ce numéro.
                    </p>
                </div>
                
                <form id="phone-form" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                        <select id="country" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            <option value="+221">Sénégal (+221)</option>
                            <option value="+33">France (+33)</option>
                            <option value="+1">États-Unis (+1)</option>
                            <option value="+44">Royaume-Uni (+44)</option>
                            <option value="+49">Allemagne (+49)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</label>
                        <div class="flex">
                            <div id="country-code" class="px-4 py-3 bg-gray-100 border border-gray-300 rounded-l-lg text-gray-700 font-medium">
                                +221
                            </div>
                            <input 
                                type="tel" 
                                id="phone" 
                                required
                                class="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="77 123 45 67"
                                maxlength="15"
                            >
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Entrez votre numéro sans l'indicatif pays</p>
                    </div>
                    
                    <button 
                        type="submit" 
                        class="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-200 flex items-center justify-center"
                    >
                        <i class="fas fa-paper-plane mr-2"></i>
                        Envoyer le code
                    </button>
                </form>
                
                <div id="phone-error" class="hidden mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                </div>
                
                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600">Numéros de test disponibles :</p>
                    <div class="mt-2 space-y-1">
                        <p class="text-xs text-gray-500">+221 77 123 45 67</p>
                        <p class="text-xs text-gray-500">+221 76 987 65 43</p>
                        <p class="text-xs text-gray-500">+221 75 555 44 33</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Gestion du formulaire de numéro de téléphone
    const phoneForm = document.getElementById('phone-form');
    const countrySelect = document.getElementById('country');
    const countryCodeDiv = document.getElementById('country-code');
    const phoneInput = document.getElementById('phone');
    
    // Mise à jour de l'indicatif pays
    countrySelect.addEventListener('change', function() {
        countryCodeDiv.textContent = this.value;
    });
    
    // Formatage du numéro de téléphone
    phoneInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, ''); // Supprimer tout sauf les chiffres
        
        // Formatage selon le pays
        const countryCode = countrySelect.value;
        if (countryCode === '+221') {
            // Format sénégalais: 77 123 45 67
            if (value.length >= 2) {
                value = value.substring(0, 2) + ' ' + value.substring(2);
            }
            if (value.length >= 6) {
                value = value.substring(0, 6) + ' ' + value.substring(6);
            }
            if (value.length >= 9) {
                value = value.substring(0, 9) + ' ' + value.substring(9);
            }
        } else if (countryCode === '+33') {
            // Format français: 06 12 34 56 78
            if (value.length >= 2) {
                value = value.substring(0, 2) + ' ' + value.substring(2);
            }
            if (value.length >= 5) {
                value = value.substring(0, 5) + ' ' + value.substring(5);
            }
            if (value.length >= 8) {
                value = value.substring(0, 8) + ' ' + value.substring(8);
            }
            if (value.length >= 11) {
                value = value.substring(0, 11) + ' ' + value.substring(11);
            }
        }
        
        this.value = value;
    });
    
    phoneForm.addEventListener('submit', handlePhoneSubmit);
}



// Gestion de la soumission du numéro de téléphone
export async function handlePhoneSubmit(e) {
    e.preventDefault();
    
    const countryCode = document.getElementById('country').value;
    const phoneNumber = document.getElementById('phone').value.replace(/\s/g, '');
    
    if (!phoneNumber) {
        showPhoneError('Veuillez saisir votre numéro de téléphone');
        return;
    }
    
    const fullPhoneNumber = countryCode + phoneNumber;
    tempPhoneNumber = fullPhoneNumber;
    
    try {
        // Simuler l'envoi du code SMS
        showMessage('Code envoyé par SMS', 'success');
        
        // Passer à l'étape de vérification
        authStep = 'code';
        setTimeout(() => {
            showVerificationCodeStep();
        }, 1000);
        
    } catch (error) {
        console.error('Erreur lors de l\'envoi du code:', error);
        showPhoneError('Erreur lors de l\'envoi du code. Veuillez réessayer.');
    }
}

// Gestion de la soumission du code de vérification
async function handleCodeSubmit(e) {
    e.preventDefault();
    
    const codeInputs = document.querySelectorAll('.code-input');
    const code = Array.from(codeInputs).map(input => input.value).join('');
    
    if (code.length !== 6) {
        showCodeError('Veuillez saisir le code complet');
        return;
    }
    
    try {
        // Vérifier le code (en production, vérifier avec le serveur)
        if (code === '123456') {
            // Code correct - créer ou récupérer l'utilisateur
            const user = await findOrCreateUser(tempPhoneNumber);
            
            // Connexion réussie
            localStorage.setItem('whatsapp_token', 'auth_token_' + user.id);
            localStorage.setItem('whatsapp_user_id', user.id.toString());
            
            showMessage('Connexion réussie !', 'success');
            setTimeout(() => {
                onAuthSuccess(user);
            }, 1000);
        } else {
            showCodeError('Code incorrect. Veuillez réessayer.');
            // Effacer les champs
            codeInputs.forEach(input => input.value = '');
            document.getElementById('verify-btn').disabled = true;
            codeInputs[0].focus();
        }
        
    } catch (error) {
        console.error('Erreur de vérification:', error);
        showCodeError('Erreur de vérification. Veuillez réessayer.');
    }
}

// Trouver ou créer un utilisateur
async function findOrCreateUser(phoneNumber) {
    try {
        // Rechercher l'utilisateur par numéro de téléphone
        const response = await fetch(`${API_BASE}/users?phone=${phoneNumber}`);
        const users = await response.json();
        
        if (users.length > 0) {
            return users[0];
        } else {
            // Créer un nouvel utilisateur
            const newUser = {
                name: phoneNumber, // Utiliser le numéro comme nom temporaire
                phone: phoneNumber,
                email: `${phoneNumber}@whatsapp.local`,
                avatar: null,
                status: 'En ligne',
                lastSeen: new Date().toISOString()
            };
            
            const createResponse = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser)
            });
            
            return await createResponse.json();
        }
    } catch (error) {
        console.error('Erreur lors de la recherche/création d\'utilisateur:', error);
        // Retourner un utilisateur factice pour le test
        return {
            id: Date.now(),
            name: phoneNumber,
            phone: phoneNumber,
            email: `${phoneNumber}@whatsapp.local`,
            avatar: null,
            status: 'En ligne',
            lastSeen: new Date().toISOString()
        };
    }
}

// Affichage des erreurs de téléphone
function showPhoneError(message) {
    const errorDiv = document.getElementById('phone-error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

// Affichage des erreurs de code
function showCodeError(message) {
    const errorDiv = document.getElementById('code-error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

// Affichage des messages de statut
function showMessage(message, type = 'info') {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}


// Fonction callback appelée depuis le fichier principal
// Cette fonction doit être définie dans le fichier principal
function onAuthSuccess(user) {
    // Cette fonction sera implémentée dans le fichier principal
    console.log('Authentification réussie pour:', user);
    
}