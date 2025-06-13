import './style.css'
import {handleLogout} from "./deconexion";
// Configuration de l'API
export const API_BASE = 'https://json-server-28pg.onrender.com'

// État global de l'application
export let currentUser = null;

let conversations = [];
let users = [];
let messages = [];
export let authStep = 'phone'; // 'phone' ou 'code'
export let tempPhoneNumber = '';

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() 
{
    checkAuthStatus();
});

// Fonction utilitaire pour normaliser les numéros de téléphone
function normalizePhoneNumber(phoneNumber) {
    // Supprimer tous les espaces, tirets, parenthèses, etc.
    return phoneNumber.replace(/[\s\-\(\)\.]/g, '');
}
// Vérification du statut d'authentification
function checkAuthStatus() 
{
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
            currentUser = await response.json();
            showMainApp();
        } else {
            showLoginPage();
        }
    } catch (error) {
        console.error('Erreur de validation de session:', error);
        showLoginPage();
    }
}

// Affichage de la page de connexion
export function showLoginPage() {
    if (authStep === 'phone') {
        showPhoneNumberStep();
    } else {
        showVerificationCodeStep();
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

// Étape 2: Saisie du code de vérification
function showVerificationCodeStep() {
    document.querySelector('#app').innerHTML = `
        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
            <div class="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                <div class="text-center mb-8">
                    <i class="fab fa-whatsapp text-6xl text-green-500 mb-4"></i>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">Code de vérification</h1>
                    <p class="text-gray-600">Entrez le code à 6 chiffres</p>
                </div>
                
                <div class="mb-6">
                    <p class="text-sm text-gray-600 text-center mb-2">
                        Nous avons envoyé un code de vérification par SMS au numéro
                    </p>
                    <p class="text-sm font-semibold text-gray-800 text-center mb-4">
                        ${tempPhoneNumber}
                    </p>
                    <button id="change-number" class="text-green-500 text-sm hover:underline">
                        Changer de numéro
                    </button>
                </div>
                
                <form id="code-form" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2 text-center">Code de vérification</label>
                        <div class="flex justify-center space-x-2">
                            <input type="text" class="code-input w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" maxlength="1" data-index="0">
                            <input type="text" class="code-input w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" maxlength="1" data-index="1">
                            <input type="text" class="code-input w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" maxlength="1" data-index="2">
                            <input type="text" class="code-input w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" maxlength="1" data-index="3">
                            <input type="text" class="code-input w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" maxlength="1" data-index="4">
                            <input type="text" class="code-input w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" maxlength="1" data-index="5">
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        id="verify-btn"
                        class="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-200 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled
                    >
                        <i class="fas fa-check mr-2"></i>
                        Vérifier
                    </button>
                </form>
                
                <div id="code-error" class="hidden mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                </div>
                
                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600 mb-2">Vous n'avez pas reçu le code ?</p>
                    <div class="space-y-2">
                        <button id="resend-sms" class="text-green-500 text-sm hover:underline block mx-auto">
                            Renvoyer le SMS
                        </button>
                        <button id="call-me" class="text-green-500 text-sm hover:underline block mx-auto">
                            M'appeler à la place
                        </button>
                    </div>
                    <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p class="text-xs text-yellow-700">
                            <i class="fas fa-info-circle mr-1"></i>
                            Code de test : <strong>123456</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Gestion des champs de saisie du code
    const codeInputs = document.querySelectorAll('.code-input');
    const verifyBtn = document.getElementById('verify-btn');
    const codeForm = document.getElementById('code-form');
    const changeNumberBtn = document.getElementById('change-number');
    const resendSmsBtn = document.getElementById('resend-sms');
    const callMeBtn = document.getElementById('call-me');
    
    // Gestion de la navigation entre les champs
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            // Permettre seulement les chiffres
            this.value = this.value.replace(/\D/g, '');
            
            // Passer au champ suivant si un chiffre est saisi
            if (this.value && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
            
            // Vérifier si tous les champs sont remplis
            const allFilled = Array.from(codeInputs).every(input => input.value);
            verifyBtn.disabled = !allFilled;
            
            // Auto-submit si tous les champs sont remplis
            if (allFilled) {
                setTimeout(() => {
                    codeForm.dispatchEvent(new Event('submit'));
                }, 500);
            }
        });
        
        input.addEventListener('keydown', function(e) {
            // Supprimer et revenir au champ précédent
            if (e.key === 'Backspace' && !this.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
        
        // Coller le code complet
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
            
            if (pastedData.length === 6) {
                codeInputs.forEach((input, i) => {
                    input.value = pastedData[i] || '';
                });
                verifyBtn.disabled = false;
                codeInputs[5].focus();
            }
        });
    });
    
    // Changer de numéro
    changeNumberBtn.addEventListener('click', function() {
        authStep = 'phone';
        showPhoneNumberStep();
    });
    
    // Renvoyer le SMS
    resendSmsBtn.addEventListener('click', function() {
        showMessage('Code renvoyé par SMS', 'success');
    });
    
    // Appeler
    callMeBtn.addEventListener('click', function() {
        showMessage('Vous allez recevoir un appel avec le code vocal', 'info');
    });
    
    codeForm.addEventListener('submit', handleCodeSubmit);
    
    // Focus sur le premier champ
    codeInputs[0].focus();
}

// Gestion de la soumission du numéro de téléphone
async function handlePhoneSubmit(e) {
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
            console.log('Code correct, recherche de l\'utilisateur pour:', tempPhoneNumber);
            
            // Code correct - créer ou récupérer l'utilisateur
            const user = await findOrCreateUser(tempPhoneNumber);
            
            if (!user || !user.id) {
                throw new Error('Impossible de créer ou récupérer l\'utilisateur');
            }
            
            // Connexion réussie
            currentUser = user;
            localStorage.setItem('whatsapp_token', 'auth_token_' + user.id);
            localStorage.setItem('whatsapp_user_id', user.id.toString());
            
            console.log('Utilisateur connecté:', currentUser);
            
            showMessage('Connexion réussie !', 'success');
            setTimeout(() => {
                showMainApp();
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
// 7. Nouvelle fonction pour charger les derniers messages vus
function loadUserLastSeenMessages() {
    try {
        const saved = localStorage.getItem(`lastSeenMessages_${currentUser.id}`);
        if (saved) {
            const data = JSON.parse(saved);
            userLastSeenMessages = new Map(Object.entries(data));
        }
    } catch (error) {
        console.error('Erreur chargement derniers messages vus:', error);
    }
}
// Trouver ou créer un utilisateur
async function findOrCreateUser(phoneNumber) {
    try {
        // Nettoyer le numéro de téléphone pour la recherche
        const cleanPhoneNumber = phoneNumber.replace(/\s+/g, '');
        
        // Rechercher l'utilisateur par numéro de téléphone
        // Utiliser une requête GET avec paramètre de recherche
        const searchResponse = await fetch(`${API_BASE}/users`);
        const allUsers = await searchResponse.json();
        
        // Chercher un utilisateur avec ce numéro de téléphone
        const existingUser = allUsers.find(user => {
            // Nettoyer le numéro stocké pour la comparaison
            const storedPhone = user.phone ? user.phone.replace(/\s+/g, '') : '';
            return storedPhone === cleanPhoneNumber;
        });
        
        if (existingUser) {
            console.log('Utilisateur existant trouvé:', existingUser);
            return existingUser;
        } else {
            console.log('Création d\'un nouvel utilisateur pour:', cleanPhoneNumber);
            
            // Créer un nouvel utilisateur
            const newUser = {
                name: `Utilisateur ${cleanPhoneNumber.slice(-4)}`, // Nom basé sur les 4 derniers chiffres
                phone: cleanPhoneNumber,
                email: `${cleanPhoneNumber.replace(/[^0-9]/g, '')}@whatsapp.local`,
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
            
            if (!createResponse.ok) {
                throw new Error('Erreur lors de la création de l\'utilisateur');
            }
            
            const createdUser = await createResponse.json();
            console.log('Nouvel utilisateur créé:', createdUser);
            return createdUser;
        }
    } catch (error) {
        console.error('Erreur lors de la recherche/création d\'utilisateur:', error);
        
        // En cas d'erreur avec l'API, retourner un utilisateur temporaire
        // (pour le développement uniquement)
        const tempUser = {
            id: Date.now(),
            name: `Utilisateur ${phoneNumber.slice(-4)}`,
            phone: phoneNumber,
            email: `${phoneNumber.replace(/[^0-9]/g, '')}@whatsapp.local`,
            avatar: null,
            status: 'En ligne',
            lastSeen: new Date().toISOString()
        };
        
        console.log('Utilisateur temporaire créé (mode développement):', tempUser);
        return tempUser;
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

// Affichage de l'application principale
function showMainApp() {
    document.querySelector('#app').innerHTML = `
        <!-- Sidebar -->
        <div class="fixed left-0 top-0 h-full w-16 let newMessageConversations = new Set();
bg-gray-100 shadow-lg flex flex-col items-center py-6 z-10">
            <!-- Navigation Items -->
            <div class="flex flex-col space-y-2">
                <!-- Messages avec badge -->
                <div class="relative sidebar-item">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200">
                        <i class="fas fa-comment-dots text-xl text-gray-700"></i>
                    </div>
                    <!-- Badge de notification -->
                    <span id="total-unread-badge" class="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">0</span>
                </div>

                <!-- Status -->
                <div class="sidebar-item">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200">
                        <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                </div>

                <!-- Chaines -->
                <div class="sidebar-item">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200">
                        <svg class="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63"/>
                        </svg>
                    </div>
                </div>

                <!-- Groupe -->
                <div class="sidebar-item">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200">
                        <i class="fas fa-users text-xl text-gray-700"></i>
                    </div>
                </div>
            </div>

            <!-- Bottom Section -->
            <div class="mt-auto flex flex-col items-center space-y-4">
                <!-- Parametre -->
                <div class="sidebar-item">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200">
                        <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                </div>

                <!-- Photo profil avec menu déroulant -->
                <div class="relative sidebar-item">
                    <div id="profile-menu-btn" class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 shadow-md">
                        <span class="text-white font-semibold text-sm">${currentUser.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <!-- Menu déroulant -->
                    <div id="profile-menu" class="hidden absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                        <div class="px-4 py-2 border-b border-gray-100">
                            <p class="font-semibold text-gray-800">${currentUser.name}</p>
                            <p class="text-sm text-gray-600">${currentUser.email}</p>
                        </div>
                        <button id="logout-btn" class="w-full text-left px-4 py-2 text-red-700 hover:bg-gray-100 flex items-center">
                            <i class="fas fa-sign-out-alt mr-2"></i>
                            Se déconnecter
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chat List Panel -->
        <div class="ml-16 w-[550px] h-full bg-white border-r border-gray-200 flex flex-col">
            <!-- Header -->
            <div class="flex justify-between items-center px-4 py-4 border-b border-gray-200">
                <h1 class="text-green-500 text-2xl font-bold">WhatsApp</h1>
                <div class="flex items-center gap-8">
                    <i class="fa-solid fa-square-plus text-2xl text-gray-600 hover:text-black cursor-pointer" onclick="showContactsSidebar()"></i>
                    <i class="fas fa-ellipsis-v text-2xl text-gray-600 hover:text-black cursor-pointer"></i>
                </div>
            </div>

            <!-- Search Bar -->
            <div class="px-4 py-2">
                <div class="relative">
                    <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input id="search-input" type="text" placeholder="Rechercher ou démarrer une discussion" 
                           class="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:bg-white border border-transparent focus:border-green-500">
                </div>
            </div>

            <!-- Filter Tabs -->
            <div class="px-4 py-2">
                <div class="flex gap-2">
                    <span class="filter-tab px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium cursor-pointer" data-filter="all">Toutes</span>
                    <span class="filter-tab px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200" data-filter="unread">Non lues</span>
                    <span class="filter-tab px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200" data-filter="favorites">Favoris</span>
                    <span class="filter-tab px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200" data-filter="groups">Groupes</span>
                </div>
            </div>

            <!-- Archived Section -->
            <div class="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-archive text-gray-500"></i>
                        <span class="text-gray-700">Archivées</span>
                    </div>
                    <span id="archived-count" class="text-green-500 text-sm font-medium">0</span>
                </div>
            </div>

            <!-- Chat List -->
            <div id="chat-list" class="flex-1 overflow-y-auto">
                <!-- Les discussions seront générées dynamiquement ici -->
                <div class="flex items-center justify-center py-8">
                    <i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i>
                </div>
            </div>
        </div>

        <!-- Discussion Area -->
        <div class="flex-1 h-full bg-gray-100 flex flex-col justify-between items-center px-4 py-6">
            <!-- Partie centrale (contenu principal) -->
            <div class="text-center mt-[250px]">
                <div class="mb-8">
                    <div class="flex items-center justify-center mb-4">
                        <div class="w-20 h-20 border-4 border-teal-400 rounded-full flex items-center justify-center mr-4">
                            <i class="fas fa-mobile-alt text-teal-400 text-2xl"></i>
                        </div>
                        <div class="w-24 h-16 border-4 border-teal-400 rounded-lg flex items-center justify-center relative">
                            <i class="fas fa-laptop text-teal-400 text-xl"></i>
                            <div class="absolute -top-2 -right-2 w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center">
                                <i class="fas fa-check text-white text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <h2 class="text-2xl font-normal text-gray-700 mb-2">WhatsApp Web</h2>
                <p class="text-gray-500 text-sm max-w-md mx-auto mb-2">
                    Bienvenue ${currentUser.name} ! Sélectionnez une conversation pour commencer.
                </p>
                <p class="text-gray-500 text-sm max-w-md mx-auto">
                    Utilisez WhatsApp sur un maximum de 4 appareils et 1 téléphone, simultanément.
                </p>
            </div>

            <!-- Texte fixe en bas -->
            <div class="flex items-center text-gray-400 text-sm mt-8">
                <i class="fas fa-lock mr-2"></i>
                <span>Vos messages personnels sont chiffrés de bout en bout</span>
            </div>
        </div>
    `;
    
    // Initialiser les événements après le rendu
    initMainAppEvents();
    loadConversations();
     // Démarrer le polling des nouveaux messages
    startMessagePolling();
}

// Initialisation des événements de l'application principale
function initMainAppEvents() {
    // Menu profil
    const profileMenuBtn = document.getElementById('profile-menu-btn');
    const profileMenu = document.getElementById('profile-menu');
    const logoutBtn = document.getElementById('logout-btn');
    
    profileMenuBtn.addEventListener('click', () => {
        profileMenu.classList.toggle('hidden');
    });
    
    // Fermer le menu si on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!profileMenuBtn.contains(e.target) && !profileMenu.contains(e.target)) {
            profileMenu.classList.add('hidden');
        }
    });
    
    // Bouton de déconnexion
    logoutBtn.addEventListener('click', handleLogout);
}

function displayConversations(conversationsToShow) {
    const chatList = document.getElementById('chat-list');
    
    if (conversationsToShow.length === 0) {
        chatList.innerHTML = `
            <div class="flex items-center justify-center py-8 text-gray-500">
                <i class="fas fa-comments mr-2"></i>
                Aucune conversation
            </div>
        `;
        return;
    }
    
    const conversationsHTML = conversationsToShow.map(conv => {
        const otherUser = getOtherUser(conv);
        const lastMessage = getLastMessage(conv);
        
        return `
            <div class="conversation-item px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100" data-conversation-id="${conv.id}">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        ${conv.isGroup 
                            ? `<i class="fas fa-users text-gray-600"></i>`
                            : `<span class="text-white font-semibold">${otherUser ? otherUser.name.charAt(0).toUpperCase() : 'U'}</span>`
                        }
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <h3 class="text-sm font-semibold text-gray-900 truncate">
                                ${conv.isGroup ? conv.groupName : (otherUser ? otherUser.name : 'Utilisateur inconnu')}
                            </h3>
                            <div class="flex items-center space-x-1">
                                ${conv.isPinned ? '<i class="fas fa-thumbtack text-gray-400 text-xs"></i>' : ''}
                                ${conv.isMuted ? '<i class="fas fa-volume-mute text-gray-400 text-xs"></i>' : ''}
                                <span class="text-xs text-gray-500">${formatTime(lastMessage?.timestamp)}</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between mt-1">
                            <p class="text-sm text-gray-600 truncate">
                                ${lastMessage ? lastMessage.content : 'Aucun message'}
                            </p>
                            ${conv.unreadCount > 0 ? 
                                `<span class="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">${conv.unreadCount}</span>` 
                                : ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    chatList.innerHTML = conversationsHTML;
    
    // Ajouter les événements de clic pour chaque conversation
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', () => {
            const conversationId = item.dataset.conversationId;
            openConversation(conversationId);
        });
    });
}

// Obtenir l'autre utilisateur dans une conversation
function getOtherUser(conversation) {
    if (conversation.isGroup) return null;
    
    // Convertir les IDs en string pour la comparaison
    const currentUserId = String(currentUser.id);
    const otherUserId = conversation.participants.find(id => String(id) !== currentUserId);
    return users.find(user => String(user.id) === String(otherUserId));
}

// Obtenir le dernier message d'une conversation
function getLastMessage(conversation) {
    if (!conversation.lastMessageId) return null;
    
    // Convertir les IDs en string pour la comparaison
    return messages.find(msg => String(msg.id) === String(conversation.lastMessageId));
}
// Formater l'heure
function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
        // Aujourd'hui - afficher l'heure
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
        // Hier
        return 'Hier';
    } else if (messageDate > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        // Cette semaine - afficher le jour
        return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
        // Plus ancien - afficher la date
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
}

// Mise à jour du compteur de messages non lus
function updateUnreadCount() {
    // Convertir l'id utilisateur en string pour la comparaison
    const currentUserId = String(currentUser.id);

    const totalUnread = conversations
        .filter(conv => conv.participants.some(participantId => String(participantId) === currentUserId))
        .reduce((total, conv) => total + (conv.unreadCount || 0), 0);

    const badge = document.getElementById('total-unread-badge');
    if (badge) {
        badge.textContent = totalUnread;
        badge.style.display = totalUnread > 0 ? 'flex' : 'none';
    }

    // Mettre à jour le compteur archivé
    const archivedCount = conversations
        .filter(conv => conv.participants.some(participantId => String(participantId) === currentUserId) && conv.isArchived)
        .length;

    const archivedBadge = document.getElementById('archived-count');
    if (archivedBadge) {
        archivedBadge.textContent = archivedCount;
    }
}

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::message

// Variables globales à ajouter
let selectedConversation = null;
let conversationMessages = [];
let pollingInterval = null;
let newMessageConversations = new Set(); // Pour tracker les conversations avec nouveaux messages
let lastMessageCheck = new Date().toISOString();
let userLastSeenMessages = new Map(); // Nouveau : tracker le dernier message vu par utilisateur


// Fonction pour afficher l'interface de conversation avec compteur de nouveaux messages
function displayConversationInterface() {
    const otherUser = getOtherUser(selectedConversation);
    const newMessagesCount = getNewMessagesCount(selectedConversation.id);
    const conversationArea = document.querySelector('.flex-1.h-full.bg-gray-100');
    
    conversationArea.innerHTML = `
        <!-- En-tête de la conversation avec compteur de nouveaux messages -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between w-[1250px]">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center relative">
                    ${selectedConversation.isGroup 
                        ? `<i class="fas fa-users text-gray-600"></i>`
                        : `<span class="text-white font-semibold">${otherUser ? otherUser.name.charAt(0).toUpperCase() : 'U'}</span>`
                    }
                    ${newMessagesCount > 0 ? 
                        `<div class="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                            ${newMessagesCount > 9 ? '9+' : newMessagesCount}
                        </div>` 
                        : ''
                    }
                </div>
                <div>
                    <h2 class="font-semibold text-gray-900 flex items-center gap-2">
                        ${selectedConversation.isGroup ? selectedConversation.groupName : (otherUser ? otherUser.name : 'Utilisateur inconnu')}
                        ${newMessagesCount > 0 ? 
                            `<span class="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                ${newMessagesCount} nouveau${newMessagesCount > 1 ? 'x' : ''} message${newMessagesCount > 1 ? 's' : ''}
                            </span>` 
                            : ''
                        }
                    </h2>
                    <p class="text-sm text-gray-500">
                        ${selectedConversation.isGroup 
                            ? `${selectedConversation.participants.length} participants`
                            : (otherUser ? `Dernière connexion ${formatTime(otherUser.lastSeen)}` : 'Hors ligne')
                        }
                    </p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                ${newMessagesCount > 0 ? 
                    `<button onclick="markAllMessagesAsRead('${selectedConversation.id}')" 
                             class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors">
                        Tout marquer comme lu
                    </button>` 
                    : ''
                }
                <i class="fas fa-video text-gray-600 text-xl cursor-pointer hover:text-green-500"></i>
                <i class="fas fa-phone text-gray-600 text-xl cursor-pointer hover:text-green-500"></i>
                <i class="fas fa-search text-gray-600 text-xl cursor-pointer hover:text-green-500"></i>
                <i class="fas fa-ellipsis-v text-gray-600 text-xl cursor-pointer hover:text-green-500"></i>
            </div>
        </div>

        <!-- Zone des messages avec section nouveaux messages -->
        <div class="flex-1 overflow-y-auto bg-gray-50 px-6 py-4" id="messages-container">
            ${displayMessagesWithNewSection()}
        </div>

        <!-- Zone de saisie -->
        <div class="bg-white border-t border-gray-200 px-6 py-4">
            <div class="flex items-center space-x-3">
                <i class="fas fa-smile text-gray-500 text-xl cursor-pointer hover:text-green-500"></i>
                <i class="fas fa-paperclip text-gray-500 text-xl cursor-pointer hover:text-green-500"></i>
                <div class="flex-1 relative w-[1070px]">
                    <input 
                        type="text" 
                        id="message-input"
                        placeholder="Tapez un message"
                        class="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-green-500"
                    >
                </div>
                <i class="fas fa-microphone text-gray-500 text-xl cursor-pointer hover:text-green-500"></i>
                <button id="send-btn" class="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    
    // Ajouter les événements
    setupConversationEvents();
    
    // Faire défiler vers le bas ou vers les nouveaux messages
    setTimeout(() => {
        const messagesContainer = document.getElementById('messages-container');
        const newMessagesSection = document.getElementById('new-messages-section');
        
        if (newMessagesSection && newMessagesCount > 0) {
            // Faire défiler vers la section des nouveaux messages
            newMessagesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Faire défiler vers le bas
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, 100);
}

// Fonction pour marquer tous les messages comme lus
async function markAllMessagesAsRead(conversationId) {
    try {
        // Marquer la conversation comme lue
        await markConversationAsRead(conversationId);
        
        // Rafraîchir l'interface
        displayConversationInterface();
        
        // Notification de succès
        showNotification('Tous les messages ont été marqués comme lus', 'success');
        
    } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error);
        showNotification('Erreur lors du marquage comme lu', 'error');
    }
}

// Fonction pour afficher les messages avec section spéciale pour les nouveaux messages
function displayMessagesWithNewSection() {
    if (conversationMessages.length === 0) {
        return `
            <div class="flex items-center justify-center py-8 text-gray-500">
                <i class="fas fa-comments mr-2"></i>
                Aucun message dans cette conversation
            </div>
        `;
    }
    
    // Séparer les messages en anciens et nouveaux
    const newMessages = conversationMessages.filter(msg => 
        String(msg.senderId) !== String(currentUser.id) && 
        isNewMessage(msg)
    );
    
    const oldMessages = conversationMessages.filter(msg => !isNewMessage(msg) || String(msg.senderId) === String(currentUser.id));
    
    let html = '';
    
    // Afficher les anciens messages
    html += oldMessages.map(message => renderMessage(message, false)).join('');
    
    // Afficher la section des nouveaux messages si il y en a
    if (newMessages.length > 0) {
        html += `
            <div id="new-messages-section" class="my-6">
                <!-- Séparateur pour nouveaux messages -->
                <div class="flex items-center justify-center my-4">
                    <div class="flex-1 h-px bg-green-300"></div>
                    <div class="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
                        <i class="fas fa-arrow-down mr-2"></i>
                        ${newMessages.length} nouveau${newMessages.length > 1 ? 'x' : ''} message${newMessages.length > 1 ? 's' : ''}
                        <i class="fas fa-arrow-down ml-2"></i>
                    </div>
                    <div class="flex-1 h-px bg-green-300"></div>
                </div>
                
                <!-- Messages nouveaux avec effet spécial -->
                <div class="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200 shadow-lg">
                    ${newMessages.map((message, index) => renderMessage(message, true, index)).join('')}
                </div>
            </div>
        `;
    }
    
    return html;
}
// Fonction pour envoyer un message - AMÉLIORÉE
async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const content = messageInput.value.trim();
    
    if (!content || !selectedConversation) return;
    
    // Vider le champ immédiatement pour une meilleure UX
    messageInput.value = '';
    
    try {
        // Créer le nouveau message
        const newMessage = {
            id: Date.now(), // ID temporaire
            conversationId: selectedConversation.id,
            senderId: currentUser.id,
            content: content,
            timestamp: new Date().toISOString(),
            isRead: false,
            isDelivered: false, // Nouveau champ pour tracking
            messageType: 'text'
        };
        
        // Ajouter immédiatement le message à l'affichage local
        messages.push(newMessage);
        conversationMessages.push(newMessage);
        
        // Rafraîchir l'affichage immédiatement
        refreshMessagesDisplay();
        
        // Simuler l'envoi avec délai de 3 secondes pour voir l'effet
        setTimeout(async () => {
            try {
                // Envoyer à l'API
                const response = await fetch(`${API_BASE}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newMessage)
                });
                
                if (response.ok) {
                    const savedMessage = await response.json();
                    
                    // Remplacer le message temporaire par le message sauvegardé
                    const tempIndex = messages.findIndex(m => m.id === newMessage.id);
                    if (tempIndex !== -1) {
                        messages[tempIndex] = savedMessage;
                    }
                    
                    const tempConvIndex = conversationMessages.findIndex(m => m.id === newMessage.id);
                    if (tempConvIndex !== -1) {
                        conversationMessages[tempConvIndex] = savedMessage;
                    }
                    
                    // Marquer comme livré
                    savedMessage.isDelivered = true;
                    
                    // Mettre à jour la conversation
                    updateConversationLastMessage(selectedConversation.id, savedMessage.id);
                    
                    // Rafraîchir l'affichage avec les nouveaux statuts
                    refreshMessagesDisplay();
                    
                    // Simuler la notification au destinataire (normalement fait par le serveur)
                    simulateRecipientNotification(savedMessage);
                }
                
                // Mettre à jour la liste des conversations
                loadConversations();
                
            } catch (error) {
                console.error('Erreur lors de l\'envoi du message:', error);
                // Le message reste affiché localement même en cas d'erreur
            }
        }, 1000); // Délai de 1 seconde pour simuler l'envoi
        
    } catch (error) {
        console.error('Erreur lors de la création du message:', error);
    }
}

function simulateRecipientNotification(message) {
    // Trouver les autres participants de la conversation
    const otherParticipants = selectedConversation.participants.filter(
        id => String(id) !== String(currentUser.id)
    );
    
    // Pour chaque autre participant, simuler la réception du message
    otherParticipants.forEach(participantId => {
        // Marquer la conversation comme ayant un nouveau message pour ce participant
        setTimeout(() => {
            // Simuler l'affichage du badge vert pour les autres utilisateurs
            showNewMessageIndicator(selectedConversation.id, participantId);
        }, 2000);
    });
}
// Fonction pour afficher l'indicateur de nouveau message
function showNewMessageIndicator(conversationId, recipientId) {
    // Cette fonction serait normalement appelée côté destinataire
    // Ici on simule l'effet pour la démo
    newMessageConversations.add(String(conversationId));
    
    // Mettre à jour les compteurs
    const conversation = conversations.find(conv => String(conv.id) === String(conversationId));
    if (conversation && String(recipientId) !== String(currentUser.id)) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    }
    
    // Rafraîchir l'affichage des conversations
    loadConversations();
}

// Fonction pour mettre à jour le dernier message d'une conversation
async function updateConversationLastMessage(conversationId, messageId) {
    try {
        const conversation = conversations.find(conv => String(conv.id) === String(conversationId));
        if (conversation) {
            conversation.lastMessageId = messageId;
            
            // Mettre à jour sur le serveur
            await fetch(`${API_BASE}/conversations/${conversationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ lastMessageId: messageId })
            });
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la conversation:', error);
    }
}

// Fonction pour démarrer le polling des nouveaux messages
function startMessagePolling() {
    // Vérifier les nouveaux messages toutes les 2 secondes
    pollingInterval = setInterval(checkForNewMessages, 2000);
}

// Fonction pour arrêter le polling
function stopMessagePolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}
function checkForNewMessages() {
    fetch(`${API_BASE}/messages`)
        .then(res => res.json())
        .then(fetchedMessages => {
            // Si de nouveaux messages sont arrivés, on met à jour l'affichage
            if (fetchedMessages.length !== messages.length) {
                messages = fetchedMessages;
                if (selectedConversation) {
                    loadConversationMessages(selectedConversation.id);
                }
                loadConversations();
            }
        });
}
// Fonction pour rendre un message individuel - AMÉLIORÉE
function renderMessage(message, isNew = false, newIndex = 0) {
    const sender = users.find(user => String(user.id) === String(message.senderId));
    const isCurrentUser = String(message.senderId) === String(currentUser.id);
    
    // Déterminer le statut du message pour l'affichage des coches
    let statusIcon = '';
    if (isCurrentUser) {
        if (message.isRead) {
            // Message lu - deux coches bleues
            statusIcon = `<i class="fas fa-check-double ml-1 text-blue-400"></i>`;
        } else if (message.isDelivered) {
            // Message livré - deux coches grises
            statusIcon = `<i class="fas fa-check-double ml-1 text-gray-400"></i>`;
        } else {
            // Message envoyé - une coche grise
            statusIcon = `<i class="fas fa-check ml-1 text-gray-400"></i>`;
        }
    }
    
    return `
        <div class="mb-4 ${isCurrentUser ? 'text-right' : 'text-left'} w-[1200px] ${isNew ? 'new-message-animation' : ''}" 
             style="${isNew ? `animation-delay: ${newIndex * 0.2}s` : ''}">
            <div class="inline-block max-w-xs lg:max-w-md">
                ${!isCurrentUser && selectedConversation.isGroup ? 
                    `<p class="text-xs ${isNew ? 'text-green-600 font-bold' : 'text-gray-500'} mb-1">
                        ${sender ? sender.name : 'Utilisateur inconnu'}
                        ${isNew ? ' • NOUVEAU' : ''}
                    </p>` 
                    : ''
                }
                <div class="px-4 py-2 rounded-lg relative ${
                    isCurrentUser 
                        ? 'bg-green-500 text-white' 
                        : isNew 
                            ? 'bg-gradient-to-r from-green-200 to-green-300 text-gray-800 shadow-lg border-2 border-green-400 new-message-bubble'
                            : 'bg-white text-gray-800 shadow-sm'
                }">
                    ${isNew && !isCurrentUser ? 
                        `<div class="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
                            !
                        </div>` 
                        : ''
                    }
                    <p class="text-sm ${isNew && !isCurrentUser ? 'font-semibold' : ''}">${message.content}</p>
                    <p class="text-xs mt-1 ${
                        isCurrentUser 
                            ? 'text-green-100' 
                            : isNew 
                                ? 'text-green-700 font-bold' 
                                : 'text-gray-500'
                    }">
                        ${formatTime(message.timestamp)}
                        ${statusIcon}
                        ${isNew && !isCurrentUser ? `<span class="ml-2 text-green-600 font-bold animate-pulse">• NOUVEAU •</span>` : ''}
                    </p>
                </div>
            </div>
        </div>
    `;
}

// 2. Correction de la fonction isNewMessage
function isNewMessage(message) {
    const conversationId = String(message.conversationId);
    const messageId = String(message.id);
    const senderId = String(message.senderId);
    const currentUserId = String(currentUser.id);
    
    // Un message est nouveau si :
    // - Il n'est pas envoyé par l'utilisateur actuel
    // - Il n'a pas été vu par cet utilisateur
    // - Il est récent (moins de 30 minutes)
    
    if (senderId === currentUserId) return false;
    
    const lastSeenMessageId = userLastSeenMessages.get(conversationId);
    const messageTime = new Date(message.timestamp);
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    return messageTime > thirtyMinutesAgo && 
           (!lastSeenMessageId || parseInt(messageId) > parseInt(lastSeenMessageId));
}

// Fonction pour obtenir le nombre de nouveaux messages dans une conversation
function getNewMessagesCount(conversationId) {
    return conversationMessages.filter(msg => 
        String(msg.conversationId) === String(conversationId) &&
        String(msg.senderId) !== String(currentUser.id) && 
        isNewMessage(msg)
    ).length;
}

// 3. Correction de la fonction handleNewMessage
function handleNewMessage(message) {
    const messageId = String(message.id);
    const conversationId = String(message.conversationId);
    const senderId = String(message.senderId);
    const currentUserId = String(currentUser.id);
    
    // Vérifier si le message n'existe pas déjà
    const existingMessage = messages.find(m => String(m.id) === messageId);
    if (existingMessage) return;
    
    console.log(`Nouveau message reçu: ${message.content} de ${senderId} pour ${currentUserId}`);
    
    // Ajouter le message à la liste
    messages.push(message);
    
    // Si ce n'est pas un message de l'utilisateur actuel
    if (senderId !== currentUserId) {
        // Marquer la conversation comme ayant un nouveau message
        newMessageConversations.add(conversationId);
        
        console.log(`Message ajouté aux nouveaux messages pour conversation ${conversationId}`);
        
        // Mettre à jour le compteur de messages non lus
        updateConversationUnreadCount(conversationId);
        
        // Si la conversation est actuellement ouverte
        if (selectedConversation && String(selectedConversation.id) === conversationId) {
            conversationMessages.push(message);
            displayConversationInterface(); // Recharger complètement l'interface
            
            // Jouer un son de notification
            playNotificationSound();
            
            // NE PAS marquer automatiquement comme lu immédiatement
            // Laisser l'utilisateur voir l'effet vert
        } else {
            // Si la conversation n'est pas ouverte, faire remonter et mettre en surbrillance
            moveConversationToTop(conversationId);
            highlightNewMessageConversation(conversationId);
        }
    }
    
    // Recharger la liste des conversations
    loadConversations();
}

// Nouvelle fonction pour afficher le badge vert
function showGreenBadge(conversationId) {
    const conversationElement = document.querySelector(`[data-conversation-id="${conversationId}"]`);
    if (conversationElement) {
        // Ajouter un badge vert animé
        const badge = document.createElement('div');
        badge.className = 'absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse new-message-badge';
        
        const avatarContainer = conversationElement.querySelector('.relative');
        if (avatarContainer && !avatarContainer.querySelector('.new-message-badge')) {
            avatarContainer.appendChild(badge);
        }
    }
}

// Nouvelle fonction pour marquer les messages comme lus (coches bleues)
async function markMessagesAsRead(conversationId) {
    try {
        // Marquer tous les messages de cette conversation comme lus
        conversationMessages.forEach(async (message) => {
            if (
                String(message.conversationId) === String(conversationId) &&
                String(message.senderId) !== String(currentUser.id) &&
                !message.isRead
            ) {
                message.isRead = true;
                // Mettre à jour sur le serveur
                await fetch(`${API_BASE}/messages/${message.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ isRead: true })
                });
            }
        });

        // Mettre à jour l'affichage
        refreshMessagesDisplay();

    } catch (error) {
        console.error('Erreur lors du marquage des messages comme lus:', error);
    }
}

// Reste du code inchangé...
async function updateConversationUnreadCount(conversationId) {
    const conversation = conversations.find(conv => String(conv.id) === String(conversationId));
    if (conversation) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        conversation.lastMessageId = messages[messages.length - 1].id;
        conversation.updatedAt = new Date().toISOString();

        try {
            await fetch(`${API_BASE}/conversations/${conversationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    unreadCount: conversation.unreadCount,
                    lastMessageId: conversation.lastMessageId,
                    updatedAt: conversation.updatedAt
                })
            });
        } catch (e) {
            console.error('Erreur update unreadCount:', e);
        }
    }
}

function moveConversationToTop(conversationId) {
    const conversationIndex = conversations.findIndex(conv => String(conv.id) === String(conversationId));
    if (conversationIndex > -1) {
        const conversation = conversations.splice(conversationIndex, 1)[0];
        conversation.updatedAt = new Date().toISOString();
        conversations.unshift(conversation);
    }
}

function highlightNewMessageConversation(conversationId) {
    setTimeout(() => {
        const conversationElement = document.querySelector(`[data-conversation-id="${conversationId}"]`);
        if (conversationElement) {
            conversationElement.classList.add('new-message-highlight');
            conversationElement.style.animation = 'newMessagePulse 0.8s ease-in-out 3';
            
            setTimeout(() => {
                conversationElement.style.animation = '';
            }, 2400);
        }
    }, 100);
}

// Fonction pour rafraîchir l'affichage des messages dans la conversation ouverte - AMÉLIORÉE
function refreshMessagesDisplay() {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer && selectedConversation) {
        // Sauvegarder la position de scroll
        const wasAtBottom = messagesContainer.scrollTop >= messagesContainer.scrollHeight - messagesContainer.clientHeight - 50;
        
        // Mettre à jour l'affichage
        messagesContainer.innerHTML = displayMessagesWithNewSection();
        
        // Si l'utilisateur était en bas, rester en bas
        if (wasAtBottom) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }
}

// Reste des fonctions inchangées...
async function loadConversations() {
    try {
        const [conversationsRes, usersRes, messagesRes] = await Promise.all([
            fetch(`${API_BASE}/conversations`),
            fetch(`${API_BASE}/users`),
            fetch(`${API_BASE}/messages`)
        ]);
        
        conversations = await conversationsRes.json();
        users = await usersRes.json();
        messages = await messagesRes.json();
        
        const currentUserId = String(currentUser.id);
        const userConversations = conversations.filter(conv => 
            conv.participants.some(participantId => String(participantId) === currentUserId)
        );
        
        displayConversations(userConversations);
        updateUnreadCount();
        
    } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error);
        document.getElementById('chat-list').innerHTML = `
            <div class="flex items-center justify-center py-8 text-red-500">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Erreur de chargement
            </div>
        `;
    }
    
    ensureConversationProperties();
    addContextMenuToConversations();
    
    conversations.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    
    const conversationsList = document.getElementById('conversations-list');
    if (!conversationsList) return;
    
    conversationsList.innerHTML = conversations.map(conversation => {
        const otherUser = getOtherUser(conversation);
        const lastMessage = getLastMessage(conversation);
        const hasNewMessage = newMessageConversations.has(String(conversation.id));
        
        return `
            <div class="conversation-item p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${hasNewMessage ? 'new-message-highlight' : ''}"
                 data-conversation-id="${conversation.id}" 
                 onclick="openConversation('${conversation.id}')">
                <div class="flex items-center space-x-3">
                    <div class="relative">
                        <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            ${conversation.isGroup 
                                ? `<i class="fas fa-users text-gray-600"></i>`
                                : `<span class="text-white font-semibold">${otherUser ? otherUser.name.charAt(0).toUpperCase() : 'U'}</span>`
                            }
                        </div>
                        ${hasNewMessage || conversation.unreadCount > 0 ? 
                            `<div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>` 
                            : ''
                        }
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <h3 class="font-semibold text-gray-900 truncate ${hasNewMessage ? 'text-green-600' : ''}">
                                ${conversation.isGroup ? conversation.groupName : (otherUser ? otherUser.name : 'Utilisateur inconnu')}
                            </h3>
                            <span class="text-xs text-gray-500">
                                ${lastMessage ? formatTime(lastMessage.timestamp) : ''}
                            </span>
                        </div>
                        <div class="flex items-center justify-between mt-1">
                            <p class="text-sm text-gray-600 truncate ${hasNewMessage ? 'font-medium text-green-700' : ''}">
                                ${lastMessage ? (lastMessage.senderId === currentUser.id ? 'Vous: ' : '') + lastMessage.content : 'Aucun message'}
                            </p>
                            ${conversation.unreadCount > 0 ? 
                                `<span class="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center animate-pulse">
                                    ${conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                                </span>` 
                                : ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Fonction pour jouer un son de notification (optionnel)
function playNotificationSound() {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiN0fPReiwGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYHAUTWrLu7qpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKY==');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Impossible de jouer le son:', e));
    } catch (error) {
        console.log('Audio non supporté');
    }
}
// 9. Modifier openConversation pour marquer comme lu après un délai plus long
function openConversation(conversationId) {
    console.log('Ouverture de la conversation:', conversationId, 'par', currentUser.name);
    
    selectedConversation = conversations.find(conv => String(conv.id) === String(conversationId));
    if (!selectedConversation) {
        console.error('Conversation non trouvée:', conversationId);
        return;
    }
    
    // Marquer visuellement
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('bg-gray-100', 'new-message-highlight');
    });
    document.querySelector(`[data-conversation-id="${conversationId}"]`)?.classList.add('bg-gray-100');
    
    // Charger les messages
    loadConversationMessages(conversationId);
    
    // Marquer comme lu après 2cgcgvgqzq secondes pour laisser le temps de voir l'effet vert
    setTimeout(() => {
        markConversationAsRead(conversationId);
        saveUserLastSeenMessages();
    }, 2000);
}
// 8. Fonction pour sauvegarder les derniers messages vus
function saveUserLastSeenMessages() {
    try {
        const data = Object.fromEntries(userLastSeenMessages);
        localStorage.setItem(`lastSeenMessages_${currentUser.id}`, JSON.stringify(data));
    } catch (error) {
        console.error('Erreur sauvegarde derniers messages vus:', error);
    }
}
// Fonction pour charger les messages d'une conversation
async function loadConversationMessages(conversationId) {
    try {
        // Filtrer les messages de cette conversation
        conversationMessages = messages.filter(msg => String(msg.conversationId) === String(conversationId));
        
        // Trier par timestamp
        conversationMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Afficher l'interface de conversation
        displayConversationInterface();
        
    } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
    }
}


// Configuration des événements de la conversation
function setupConversationEvents() {
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    
    // Envoyer message avec Enter
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Envoyer message avec le bouton
    sendBtn.addEventListener('click', sendMessage);
}


// 5. Amélioration de la fonction markConversationAsRead
async function markConversationAsRead(conversationId) {
    try {
        const conversation = conversations.find(conv => String(conv.id) === String(conversationId));
        if (conversation) {
            // Marquer tous les messages de cette conversation comme vus
            const conversationMessages = messages.filter(msg => 
                String(msg.conversationId) === String(conversationId)
            );
            
            if (conversationMessages.length > 0) {
                const lastMessageId = Math.max(...conversationMessages.map(m => parseInt(m.id)));
                userLastSeenMessages.set(String(conversationId), String(lastMessageId));
            }
            
            // Réinitialiser le compteur
            conversation.unreadCount = 0;
            
            // Retirer de la liste des nouvelles conversations
            newMessageConversations.delete(String(conversationId));
            
            // Mettre à jour sur le serveur
            await fetch(`${API_BASE}/conversations/${conversationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    unreadCount: 0,
                    lastSeenBy: {
                        ...conversation.lastSeenBy,
                        [currentUser.id]: new Date().toISOString()
                    }
                })
            });
            
            console.log(`Conversation ${conversationId} marquée comme lue`);
            
            // Mettre à jour l'affichage
            updateUnreadCount();
            loadConversations();
            
            // Rafraîchir l'affichage des messages
            if (selectedConversation && String(selectedConversation.id) === String(conversationId)) {
                displayConversationInterface();
            }
        }
    } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error);
    }
}


// 6. Fonction d'initialisation améliorée
function initializeMessageSystem() {
    if (!currentUser) {
        // L'utilisateur n'est pas encore connecté, ne pas initialiser le système de messages
        return;
    }
    console.log('Initialisation du système de messages pour:', currentUser.name);
    
    // Charger les derniers messages vus depuis le localStorage ou le serveur
    loadUserLastSeenMessages();
    
    // Démarrer le polling des nouveaux messages
    startMessagePolling();
    
    // Ajouter les styles CSS
    addMessageStyles();
}
// Fonction de nettoyage à appeler lors de la fermeture de l'application
function cleanupMessageSystem() {
    stopMessagePolling();
}

// Appeler l'initialisation au chargement
document.addEventListener('DOMContentLoaded', initializeMessageSystem);

// Nettoyer lors de la fermeture
window.addEventListener('beforeunload', cleanupMessageSystem);


//::::::::::::::::::::::::::::option en cliquant sur une discussion 

// Variables globales à ajouter (si pas déjà présentes)
let contextMenu = null;
let contextMenuConversationId = null;

// Fonction pour créer le menu contextuel
function createContextMenu() {
    // Supprimer le menu existant s'il y en a un
    const existingMenu = document.getElementById('context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    contextMenu = document.createElement('div');
    contextMenu.id = 'context-menu';
    contextMenu.className = 'fixed bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-[9999] min-w-48 hidden';
    
    contextMenu.innerHTML = `
        <div class="context-menu-item px-4 py-2 hover:bg-red-50 cursor-pointer flex items-center space-x-3" data-action="delete">
            <i class="fas fa-trash text-red-500 w-4"></i>
            <span class="text-sm text-gray-700">Supprimer</span>
        </div>
        <div class="context-menu-item px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3" data-action="archive">
            <i class="fas fa-archive text-gray-500 w-4" id="archive-icon"></i>
            <span class="text-sm text-gray-700" id="archive-text">Archiver</span>
        </div>
        <div class="context-menu-item px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3" data-action="pin">
            <i class="fas fa-thumbtack text-gray-500 w-4" id="pin-icon"></i>
            <span class="text-sm text-gray-700" id="pin-text">Épingler</span>
        </div>
        <div class="border-t border-gray-200 my-1"></div>
        <div class="context-menu-item px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center space-x-3" data-action="mark-unread">
            <i class="fas fa-envelope text-blue-500 w-4"></i>
            <span class="text-sm text-gray-700">Marquer comme non lue</span>
        </div>
        <div class="context-menu-item px-4 py-2 hover:bg-yellow-50 cursor-pointer flex items-center space-x-3" data-action="favorite">
            <i class="far fa-star text-yellow-500 w-4" id="favorite-icon"></i>
            <span class="text-sm text-gray-700" id="favorite-text">Ajouter aux favoris</span>
        </div>
        <div class="border-t border-gray-200 my-1"></div>
        <div class="context-menu-item px-4 py-2 hover:bg-red-50 cursor-pointer flex items-center space-x-3" data-action="block">
            <i class="fas fa-ban text-red-500 w-4"></i>
            <span class="text-sm text-gray-700" id="block-text">Bloquer</span>
        </div>
    `;
    
    document.body.appendChild(contextMenu);
    
    // Ajouter l'événement click au menu
    contextMenu.addEventListener('click', function(event) {
        const menuItem = event.target.closest('.context-menu-item');
        if (menuItem) {
            const action = menuItem.getAttribute('data-action');
            // IMPORTANT: Capturer l'ID avant de fermer le menu
            const conversationId = contextMenuConversationId;
            console.log('Action sélectionnée:', action, 'pour conversation:', conversationId);
            
            // Fermer le menu immédiatement
            hideContextMenu();
            
            // Traiter l'action avec l'ID capturé
            if (conversationId) {
                handleContextMenuAction(action, conversationId);
            } else {
                console.error('Aucune conversation sélectionnée');
            }
        }
    });
    
    // Fermer le menu si on clique en dehors
    document.addEventListener('click', function(event) {
        if (contextMenu && !contextMenu.contains(event.target)) {
            hideContextMenu();
        }
    });
}

// Fonction pour afficher le menu contextuel
function showContextMenu(event, conversationId) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Affichage du menu contextuel pour la conversation:', conversationId);
    
    if (!contextMenu) {
        createContextMenu();
    }
    
    contextMenuConversationId = conversationId;
    const conversation = conversations.find(conv => String(conv.id) === String(conversationId));
    
    if (conversation) {
        // Initialiser les propriétés si elles n'existent pas
        if (conversation.isArchived === undefined) conversation.isArchived = false;
        if (conversation.isPinned === undefined) conversation.isPinned = false;
        if (conversation.isFavorite === undefined) conversation.isFavorite = false;
        if (conversation.isBlocked === undefined) conversation.isBlocked = false;
        
        // Mettre à jour les textes et icônes selon l'état actuel
        updateContextMenuItems(conversation);
    }
    
    // Positionner le menu
    const x = event.pageX;
    const y = event.pageY;
    
    // Vérifier que le menu ne dépasse pas de l'écran
    const menuWidth = 192; // min-w-48 = 12rem = 192px
    const menuHeight = 280; // hauteur approximative
    
    const finalX = (x + menuWidth > window.innerWidth) ? x - menuWidth : x;
    const finalY = (y + menuHeight > window.innerHeight) ? y - menuHeight : y;
    
    contextMenu.style.left = `${finalX}px`;
    contextMenu.style.top = `${finalY}px`;
    contextMenu.classList.remove('hidden');
    
    console.log('Menu positionné à:', finalX, finalY);
}

// Fonction pour mettre à jour les éléments du menu contextuel
function updateContextMenuItems(conversation) {
    const archiveText = document.getElementById('archive-text');
    const archiveIcon = document.getElementById('archive-icon');
    const pinText = document.getElementById('pin-text');
    const pinIcon = document.getElementById('pin-icon');
    const favoriteText = document.getElementById('favorite-text');
    const favoriteIcon = document.getElementById('favorite-icon');
    const blockText = document.getElementById('block-text');
    
    if (archiveText && archiveIcon) {
        archiveText.textContent = conversation.isArchived ? 'Désarchiver' : 'Archiver';
        archiveIcon.className = conversation.isArchived ? 'fas fa-box-open text-gray-500 w-4' : 'fas fa-archive text-gray-500 w-4';
    }
    
    if (pinText && pinIcon) {
        pinText.textContent = conversation.isPinned ? 'Désépingler' : 'Épingler';
        pinIcon.className = conversation.isPinned ? 'fas fa-thumbtack text-green-500 w-4' : 'fas fa-thumbtack text-gray-500 w-4';
    }
    
    if (favoriteText && favoriteIcon) {
        favoriteText.textContent = conversation.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
        favoriteIcon.className = conversation.isFavorite ? 'fas fa-star text-yellow-500 w-4' : 'far fa-star text-yellow-500 w-4';
    }
    
    if (blockText) {
        blockText.textContent = conversation.isBlocked ? 'Débloquer' : 'Bloquer';
    }
}

// Fonction pour masquer le menu contextuel
function hideContextMenu() {
    if (contextMenu) {
        contextMenu.classList.add('hidden');
    }
    // NE PAS réinitialiser contextMenuConversationId ici
    // Il sera réinitialisé quand une nouvelle conversation sera sélectionnée
}

// Fonction pour gérer les actions du menu contextuel
function handleContextMenuAction(action, conversationId) {
    console.log('Traitement de l\'action:', action, 'pour conversation:', conversationId);
    
    if (!conversationId) {
        console.error('Aucune conversation fournie');
        return;
    }
    
    const conversation = conversations.find(conv => String(conv.id) === String(conversationId));
    if (!conversation) {
        console.error('Conversation introuvable:', conversationId);
        return;
    }
    
    // Réinitialiser contextMenuConversationId après utilisation
    contextMenuConversationId = null;
    
    switch (action) {
        case 'delete':
            deleteConversation(conversationId);
            break;
        case 'archive':
            toggleArchiveConversation(conversationId);
            break;
        case 'pin':
            togglePinConversation(conversationId);
            break;
        case 'mark-unread':
            markConversationAsUnread(conversationId);
            break;
        case 'favorite':
            toggleFavoriteConversation(conversationId);
            break;
        case 'block':
            toggleBlockConversation(conversationId);
            break;
        default:
            console.error('Action inconnue:', action);
    }
}

// Fonction pour supprimer une conversation
async function deleteConversation(conversationId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.')) {
        console.log('Suppression de la conversation:', conversationId);
        
        try {
            // Supprimer sur le serveur JSON Server
            const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Supprimer aussi tous les messages associés
                const relatedMessages = messages.filter(msg => String(msg.conversationId) === String(conversationId));
                for (const message of relatedMessages) {
                    await fetch(`${API_BASE}/messages/${message.id}`, {
                        method: 'DELETE'
                    });
                }
                
                // Supprimer de la liste locale
                const index = conversations.findIndex(conv => String(conv.id) === String(conversationId));
                if (index !== -1) {
                    conversations.splice(index, 1);
                }
                
                // Supprimer les messages de la liste locale
                messages = messages.filter(msg => String(msg.conversationId) !== String(conversationId));
                
                // Si c'était la conversation sélectionnée, fermer l'interface
                if (selectedConversation && String(selectedConversation.id) === String(conversationId)) {
                    selectedConversation = null;
                    conversationMessages = [];
                    displayDefaultInterface();
                }
                
                // Recharger la liste
                loadConversations();
                
                showNotification('Conversation supprimée', 'success');
            } else {
                throw new Error('Erreur lors de la suppression sur le serveur');
            }
            
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}

// Fonction pour archiver/désarchiver une conversation
async function toggleArchiveConversation(conversationId) {
    try {
        const conversation = conversations.find(conv => String(conv.id) === String(conversationId));
        const newArchivedState = !conversation.isArchived;
        
        console.log('Basculement archivage:', conversationId, 'vers', newArchivedState);
        
        // Mettre à jour sur le serveur JSON Server
        const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isArchived: newArchivedState })
        });
        
        if (response.ok) {
            // Mettre à jour localement
            conversation.isArchived = newArchivedState;
            
            // Si on archive la conversation sélectionnée, fermer l'interface
            if (newArchivedState && selectedConversation && String(selectedConversation.id) === String(conversationId)) {
                selectedConversation = null;
                conversationMessages = [];
                displayDefaultInterface();
            }
            
            loadConversations();
            showNotification(newArchivedState ? 'Conversation archivée' : 'Conversation désarchivée', 'success');
        } else {
            throw new Error('Erreur lors de la mise à jour sur le serveur');
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'archivage:', error);
        showNotification('Erreur lors de l\'archivage', 'error');
    }
}

// Fonction pour épingler/désépingler une conversation
async function togglePinConversation(conversationId) {
    try {
        const conversation = conversations.find(conv => String(conv.id) === String(conversationId));
        const newPinnedState = !conversation.isPinned;
        
        console.log('Basculement épinglage:', conversationId, 'vers', newPinnedState);
        
        // Mettre à jour sur le serveur JSON Server
        const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isPinned: newPinnedState })
        });
        
        if (response.ok) {
            conversation.isPinned = newPinnedState;
            loadConversations();
            showNotification(newPinnedState ? 'Conversation épinglée' : 'Conversation désépinglée', 'success');
        } else {
            throw new Error('Erreur lors de la mise à jour sur le serveur');
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'épinglage:', error);
        showNotification('Erreur lors de l\'épinglage', 'error');
    }
}

// Fonction pour marquer comme non lue
async function markConversationAsUnread(conversationId) {
    try {
        const conversation = conversations.find(conv => String(conv.id) === String(conversationId));
        
        console.log('Marquage comme non lue:', conversationId);
        
        // Mettre à jour sur le serveur JSON Server
        const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ unreadCount: 1 })
        });
        
        if (response.ok) {
            conversation.unreadCount = 1;
            loadConversations();
            
            // Mettre à jour le compteur global
            if (typeof updateUnreadCount === 'function') {
                updateUnreadCount();
            }
            
            showNotification('Conversation marquée comme non lue', 'success');
        } else {
            throw new Error('Erreur lors de la mise à jour sur le serveur');
        }
        
    } catch (error) {
        console.error('Erreur lors du marquage:', error);
        showNotification('Erreur lors du marquage', 'error');
    }
}

// Fonction pour ajouter/retirer des favoris
async function toggleFavoriteConversation(conversationId) {
    try {
        const conversation = conversations.find(conv => String(conv.id) === String(conversationId));
        const newFavoriteState = !conversation.isFavorite;
        
        console.log('Basculement favori:', conversationId, 'vers', newFavoriteState);
        
        // Mettre à jour sur le serveur JSON Server
        const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isFavorite: newFavoriteState })
        });
        
        if (response.ok) {
            conversation.isFavorite = newFavoriteState;
            loadConversations();
            showNotification(newFavoriteState ? 'Conversation ajoutée aux favoris' : 'Conversation retirée des favoris', 'success');
        } else {
            throw new Error('Erreur lors de la mise à jour sur le serveur');
        }
        
    } catch (error) {
        console.error('Erreur lors de la gestion des favoris:', error);
        showNotification('Erreur lors de la gestion des favoris', 'error');
    }
}

// Fonction pour bloquer/débloquer une conversation
async function toggleBlockConversation(conversationId) {
    try {
        const conversation = conversations.find(conv => String(conv.id) === String(conversationId));
        const newBlockedState = !conversation.isBlocked;
        
        console.log('Basculement blocage:', conversationId, 'vers', newBlockedState);
        
        // Mettre à jour sur le serveur JSON Server
        const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isBlocked: newBlockedState })
        });
        
        if (response.ok) {
            conversation.isBlocked = newBlockedState;
            
            // Si on bloque la conversation sélectionnée, fermer l'interface
            if (newBlockedState && selectedConversation && String(selectedConversation.id) === String(conversationId)) {
                selectedConversation = null;
                conversationMessages = [];
                displayDefaultInterface();
            }
            
            loadConversations();
            showNotification(newBlockedState ? 'Conversation bloquée' : 'Conversation débloquée', 'success');
        } else {
            throw new Error('Erreur lors de la mise à jour sur le serveur');
        }
        
    } catch (error) {
        console.error('Erreur lors du blocage:', error);
        showNotification('Erreur lors du blocage', 'error');
    }
}

// Fonction pour afficher les notifications
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification-toast');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification-toast fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-[10000] text-sm font-medium ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Supprimer automatiquement après 3 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Fonction pour afficher l'interface par défaut
function displayDefaultInterface() {
    const conversationArea = document.querySelector('.flex-1.h-full.bg-gray-100');
    if (conversationArea) {
        conversationArea.innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="text-center text-gray-500">
                    <i class="fas fa-comments text-6xl mb-4"></i>
                    <h2 class="text-xl font-semibold mb-2">Sélectionnez une conversation</h2>
                    <p>Choisissez une conversation dans la liste pour commencer à discuter</p>
                </div>
            </div>
        `;
    }
}

// Fonction pour ajouter les événements de menu contextuel aux conversations
function addContextMenuToConversations() {
    console.log('Ajout des événements de menu contextuel');
    
    document.querySelectorAll('.conversation-item').forEach(item => {
        // Supprimer l'ancien événement s'il existe
        item.removeEventListener('contextmenu', item._contextMenuHandler);
        
        // Créer le nouvel événement
        item._contextMenuHandler = function(event) {
            const conversationId = this.getAttribute('data-conversation-id');
            console.log('Clic droit sur conversation:', conversationId);
            showContextMenu(event, conversationId);
        };
        
        // Ajouter l'événement
        item.addEventListener('contextmenu', item._contextMenuHandler);
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du menu contextuel');
    createContextMenu();
    
    // Fermer le menu avec la touche Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hideContextMenu();
        }
    });
});

// Fonction utilitaire pour s'assurer que les propriétés nécessaires existent
function ensureConversationProperties() {
    conversations.forEach(conversation => {
        if (conversation.isArchived === undefined) conversation.isArchived = false;
        if (conversation.isPinned === undefined) conversation.isPinned = false;
        if (conversation.isFavorite === undefined) conversation.isFavorite = false;
        if (conversation.isBlocked === undefined) conversation.isBlocked = false;
        if (conversation.unreadCount === undefined) conversation.unreadCount = 0;
    });
}

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: quand on clique sur le bouton plus
// Fonction pour afficher la sidebar glissante
function showContactsSidebar() {
    // Créer l'overlay si il n'existe pas
    let overlay = document.getElementById('contacts-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'contacts-overlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-40 opacity-0 transition-opacity duration-300';
        overlay.onclick = hideContactsSidebar;
        document.body.appendChild(overlay);
    }

    // Créer la sidebar si elle n'existe pas
    let sidebar = document.getElementById('contacts-sidebar');
    if (!sidebar) {
        sidebar = document.createElement('div');
        sidebar.id = 'contacts-sidebar';
        sidebar.className = 'fixed top-0 left-0 h-full w-96 bg-white shadow-2xl z-50 transform -translate-x-full transition-transform duration-300 ease-in-out';
        
        sidebar.innerHTML = `
            <!-- En-tête de la sidebar -->
            <div class="bg-green-500 text-white p-6 flex items-center justify-between">
                <h2 class="text-xl font-bold flex items-center">
                    <i class="fas fa-address-book mr-3"></i>
                    Contacts & Groupes
                </h2>
                <button onclick="hideContactsSidebar()" class="text-white hover:bg-green-600 p-2 rounded-full transition-colors">
                    <i class="fas fa-times text-lg"></i>
                </button>
            </div>

            <!-- Contenu de la sidebar -->
            <div class="flex flex-col h-full">
                <!-- Barre de recherche -->
                <div class="p-4 border-b border-gray-200">
                    <div class="relative">
                        <input 
                            type="text" 
                            id="contacts-search"
                            placeholder="Rechercher un contact..."
                            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                        >
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>

                <!-- Boutons d'action -->
                <div class="p-4 space-y-3 border-b border-gray-200">
                    <!-- Bouton Nouveau Contact -->
                    <button 
                        onclick="showAddContactModal()" 
                        class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        <i class="fas fa-user-plus"></i>
                        <span>Ajouter un contact</span>
                    </button>

                    <!-- Bouton Nouveau Groupe -->
                    <button 
                        onclick="showAddGroupModal()" 
                        class="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        <i class="fas fa-users-plus"></i>
                        <span>Créer un groupe</span>
                    </button>

                    <!-- Bouton Actualiser -->
                    <button 
                        onclick="refreshContactsList()" 
                        class="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        <i class="fas fa-sync-alt"></i>
                        <span>Actualiser</span>
                    </button>
                </div>

                <!-- Liste des contacts -->
                <div class="flex-1 overflow-y-auto">
                    <div class="p-4">
                        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Tous les contacts (<span id="contacts-count">0</span>)
                        </h3>
                        <div id="contacts-list" class="space-y-2">
                            <div class="text-center py-4">
                                <i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i>
                                <p class="text-gray-500 mt-2">Chargement des contacts...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(sidebar);
        
        // Charger les contacts depuis le serveur
        loadContactsFromServer();
        
        // Ajouter l'événement de recherche
        setTimeout(() => {
            const searchInput = document.getElementById('contacts-search');
            if (searchInput) {
                searchInput.addEventListener('input', filterContacts);
            }
        }, 100);
    }

    // Afficher l'overlay et la sidebar avec animation
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        overlay.classList.add('opacity-100');
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0');
    }, 10);
}

// Fonction pour masquer la sidebar
function hideContactsSidebar() {
    const overlay = document.getElementById('contacts-overlay');
    const sidebar = document.getElementById('contacts-sidebar');
    
    if (overlay && sidebar) {
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0');
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('-translate-x-full');
        
        // Supprimer les éléments après l'animation
        setTimeout(() => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            if (sidebar.parentNode) sidebar.parentNode.removeChild(sidebar);
        }, 300);
    }
}

// Fonction pour charger les contacts depuis le serveur
async function loadContactsFromServer() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        
        if (response.ok) {
            const serverUsers = await response.json();
            // Mettre à jour la variable globale users
            users = serverUsers;
            // Mettre à jour l'affichage
            updateContactsDisplay();
        } else {
            throw new Error('Erreur lors du chargement des utilisateurs');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des contacts:', error);
        showNotif('Erreur lors du chargement des contacts', 'error');
        
        // Utiliser les données locales en cas d'erreur
        if (users && users.length > 0) {
            updateContactsDisplay();
        } else {
            const contactsList = document.getElementById('contacts-list');
            if (contactsList) {
                contactsList.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
                        <p>Impossible de charger les contacts</p>
                        <button onclick="loadContactsFromServer()" class="mt-2 text-blue-500 hover:underline">
                            Réessayer
                        </button>
                    </div>
                `;
            }
        }
    }
}

// Fonction pour actualiser la liste des contacts
async function refreshContactsList() {
    const refreshButton = event.target.closest('button');
    const icon = refreshButton.querySelector('i');
    
    // Animation de rotation
    icon.classList.add('fa-spin');
    refreshButton.disabled = true;
    
    try {
        await loadContactsFromServer();
        showNotification('Contacts actualisés', 'success');
    } catch (error) {
        showNotif('Erreur lors de l\'actualisation', 'error');
    } finally {
        icon.classList.remove('fa-spin');
        refreshButton.disabled = false;
    }
}

// Fonction pour mettre à jour l'affichage des contacts
function updateContactsDisplay() {
    const contactsList = document.getElementById('contacts-list');
    const contactsCount = document.getElementById('contacts-count');
    
    if (contactsList) {
        contactsList.innerHTML = renderContactsList();
    }
    
    if (contactsCount) {
        const availableContacts = users.filter(u => u.id !== currentUser.id);
        contactsCount.textContent = availableContacts.length;
    }
}

// Fonction pour rendre la liste des contacts
function renderContactsList() {
    if (!users || users.length <= 1) {
        return `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-address-book text-4xl mb-3"></i>
                <p>Aucun contact disponible</p>
                <button onclick="showAddContactModal()" class="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Ajouter votre premier contact
                </button>
            </div>
        `;
    }

    const contacts = users.filter(user => user.id !== currentUser.id);
    
    return contacts.map(contact => `
        <div class="contact-item flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group" 
             onclick="startConversationWithContact('${contact.id}')">
            <!-- Avatar -->
            <div class="relative mr-3">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    ${contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
                </div>
                <!-- Indicateur de statut -->
                <div class="absolute -bottom-1 -right-1 w-4 h-4 ${contact.isOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white rounded-full"></div>
            </div>
            
            <!-- Informations du contact -->
            <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-900 group-hover:text-green-600 transition-colors truncate">
                    ${contact.name || 'Sans nom'}
                </h4>
                <p class="text-sm text-gray-500 truncate">
                    ${contact.email || 'Pas d\'email'}
                </p>
                <p class="text-xs text-gray-400">
                    ${contact.isOnline ? 'En ligne' : `Vu ${formatTimes(contact.lastSeen || new Date().toISOString())}`}
                </p>
            </div>
            
            <!-- Actions -->
            <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onclick="event.stopPropagation(); startConversationWithContact('${contact.id}')"
                    class="p-2 text-green-500 hover:bg-green-100 rounded-full transition-colors"
                    title="Envoyer un message"
                >
                    <i class="fas fa-comment text-sm"></i>
                </button>
                <button 
                    onclick="event.stopPropagation(); callContact('${contact.id}')"
                    class="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                    title="Appeler"
                >
                    <i class="fas fa-phone text-sm"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Fonction pour filtrer les contacts
function filterContacts() {
    const searchTerm = document.getElementById('contacts-search').value.toLowerCase();
    const contactItems = document.querySelectorAll('.contact-item');
    
    contactItems.forEach(item => {
        const contactName = item.querySelector('h4').textContent.toLowerCase();
        const contactEmail = item.querySelector('p').textContent.toLowerCase();
        
        if (contactName.includes(searchTerm) || contactEmail.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Fonction pour démarrer une conversation avec un contact
function startConversationWithContact(contactId) {
    // Vérifier si une conversation existe déjà
    const existingConversation = conversations.find(conv => 
        !conv.isGroup && 
        conv.participants.includes(parseInt(contactId)) && 
        conv.participants.includes(currentUser.id)
    );
    
    if (existingConversation) {
        // Ouvrir la conversation existante
        openConversation(existingConversation.id);
        hideContactsSidebar();
    } else {
        // Créer une nouvelle conversation
        createNewConversation([parseInt(contactId)], false);
    }
}

// Fonction pour créer une nouvelle conversation
async function createNewConversation(participantIds, isGroup = false, groupName = '') {
    try {
        const newConversation = {
            id: Date.now(),
            participants: [currentUser.id, ...participantIds],
            isGroup: isGroup,
            groupName: groupName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMessageId: null,
            unreadCount: 0
        };
        
        // Envoyer à l'API
        const response = await fetch(`${API_BASE}/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
            },
            body: JSON.stringify(newConversation)
        });
        
        if (response.ok) {
            const savedConversation = await response.json();
            conversations.unshift(savedConversation);
            openConversation(savedConversation.id);
            showNotif('Nouvelle conversation créée', 'success');
        } else {
            throw new Error('Erreur serveur lors de la création de la conversation');
        }
        
    } catch (error) {
        console.error('Erreur lors de la création de la conversation:', error);
        
        // Créer localement en cas d'erreur réseau
        const newConversation = {
            id: Date.now(),
            participants: [currentUser.id, ...participantIds],
            isGroup: isGroup,
            groupName: groupName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMessageId: null,
            unreadCount: 0
        };
        
        conversations.unshift(newConversation);
        openConversation(newConversation.id);
        showNotification('Conversation créée localement (sera synchronisée)', 'warning');
    } finally {
        hideContactsSidebar();
        loadConversations();
    }
}

// Fonction pour afficher le modal d'ajout de contact
function showAddContactModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 w-96 max-w-sm mx-4 transform transition-all">
            <h3 class="text-xl font-bold mb-4 text-gray-900">Ajouter un contact</h3>
            <form onsubmit="addNewContact(event)">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nom du contact *</label>
                        <input 
                            type="text" 
                            id="contact-name"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                            placeholder="Nom complet"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input 
                            type="email" 
                            id="contact-email"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                            placeholder="email@exemple.com"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone (optionnel)</label>
                        <input 
                            type="tel" 
                            id="contact-phone"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                            placeholder="+221 XX XXX XX XX"
                        >
                    </div>
                </div>
                <div class="flex space-x-3 mt-6">
                    <button 
                        type="button"
                        onclick="this.closest('.fixed').remove()"
                        class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit"
                        class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        id="add-contact-btn"
                    >
                        <span>Ajouter</span>
                        <i class="fas fa-spinner fa-spin ml-2 hidden"></i>
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Fonction pour afficher le modal de création de groupe
function showAddGroupModal() {
    // Rafraîchir la liste des contacts disponibles
    const availableContacts = users.filter(user => user.id !== currentUser.id);
    
    if (availableContacts.length < 2) {
        showNotif('Vous devez avoir au moins 2 contacts pour créer un groupe', 'warning');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 w-96 max-w-sm mx-4 max-h-96 overflow-y-auto transform transition-all">
            <h3 class="text-xl font-bold mb-4 text-gray-900">Créer un groupe</h3>
            <form onsubmit="createNewGroup(event)">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nom du groupe *</label>
                        <input 
                            type="text" 
                            id="group-name"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                            placeholder="Nom du groupe"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Sélectionner les membres</label>
                        <div class="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                            ${availableContacts.map(contact => `
                                <label class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="group-members" 
                                        value="${contact.id}"
                                        class="mr-3 text-green-500 focus:ring-green-500"
                                    >
                                    <div class="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                        ${(contact.name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div class="flex-1">
                                        <span class="text-sm font-medium">${contact.name || 'Sans nom'}</span>
                                        <p class="text-xs text-gray-500">${contact.email || ''}</p>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Sélectionnez au moins 2 membres</p>
                    </div>
                </div>
                <div class="flex space-x-3 mt-6">
                    <button 
                        type="button"
                        onclick="this.closest('.fixed').remove()"
                        class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit"
                        class="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        id="create-group-btn"
                    >
                        <span>Créer</span>
                        <i class="fas fa-spinner fa-spin ml-2 hidden"></i>
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Fonction pour ajouter un nouveau contact
async function addNewContact(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('add-contact-btn');
    const btnText = submitBtn.querySelector('span');
    const btnSpinner = submitBtn.querySelector('i');
    
    // Afficher le spinner
    btnText.textContent = 'Ajout...';
    btnSpinner.classList.remove('hidden');
    submitBtn.disabled = true;
    
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    
    if (!name || !email) {
        showNotif('Nom et email sont requis', 'error');
        resetButton();
        return;
    }
    
    try {
        const newContact = {
            name: name,
            email: email,
            phone: phone || '',
            isOnline: false,
            lastSeen: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        // Envoyer au serveur
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
            },
            body: JSON.stringify(newContact)
        });
        
        if (response.ok) {
            const savedContact = await response.json();
            
            // Ajouter à la liste locale
            users.push(savedContact);
            
            // Fermer le modal
            event.target.closest('.fixed').remove();
            
            // Mettre à jour l'affichage
            updateContactsDisplay();
            
            showNotification(`Contact "${name}" ajouté avec succès`, 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de l\'ajout du contact');
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'ajout du contact:', error);
        showNotif(error.message || 'Erreur lors de l\'ajout du contact', 'error');
        resetButton();
    }
    
    function resetButton() {
        btnText.textContent = 'Ajouter';
        btnSpinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

// Fonction pour créer un nouveau groupe
async function createNewGroup(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('create-group-btn');
    const btnText = submitBtn.querySelector('span');
    const btnSpinner = submitBtn.querySelector('i');
    
    // Afficher le spinner
    btnText.textContent = 'Création...';
    btnSpinner.classList.remove('hidden');
    submitBtn.disabled = true;
    
    const groupName = document.getElementById('group-name').value.trim();
    const selectedMembers = Array.from(document.querySelectorAll('input[name="group-members"]:checked'))
        .map(checkbox => parseInt(checkbox.value));
    
    if (!groupName || selectedMembers.length < 2) {
        showNotif('Veuillez saisir un nom et sélectionner au moins 2 membres', 'error');
        resetButton();
        return;
    }
    
    try {
        // Fermer le modal
        event.target.closest('.fixed').remove();
        
        // Créer la conversation de groupe
        await createNewConversation(selectedMembers, true, groupName);
        
        hideContactsSidebar();
        showNotif(`Groupe "${groupName}" créé avec succès`, 'success');
        
    } catch (error) {
        console.error('Erreur lors de la création du groupe:', error);
        showNotif('Erreur lors de la création du groupe', 'error');
    }
    
    function resetButton() {
        btnText.textContent = 'Créer';
        btnSpinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

// Fonction pour appeler un contact (placeholder)
function callContact(contactId) {
    const contact = users.find(u => u.id == contactId);
    if (contact) {
        showNotif(`Appel vers ${contact.name}...`, 'info');
        // Ici vous pouvez implémenter la logique d'appel
    }
}

// Fonction pour afficher les notifications
function showNotif(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-70 px-6 py-3 rounded-lg text-white font-medium transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    }, 10);
    
    // Animation de sortie et suppression
    setTimeout(() => {
        notification.classList.remove('translate-x-0');
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Fonction utilitaire pour formater le temps (si elle n'existe pas déjà)
function formatTimes(dateString) {
    if (!dateString) return 'jamais';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'à l\'instant';
    if (minutes < 60) return `il y a ${minutes} min`;
    if (hours < 24) return `il y a ${hours}h`;
    if (days < 7) return `il y a ${days}j`;
    
    return date.toLocaleDateString('fr-FR');
}

// Ajouter l'événement au bouton "+" dans votre HTML
// <i class="fa-solid fa-square-plus text-2xl text-gray-600 hover:text-black cursor-pointer" onclick="showContactsSidebar()"></i>
window.showContactsSidebar = showContactsSidebar;
window.showAddContactModal = showAddContactModal;
window.showAddGroupModal = showAddGroupModal;
window.startConversationWithContact = startConversationWithContact;
window.callContact = callContact;
window.addNewContact = addNewContact;
window.createNewGroup = createNewGroup;
window.hideContactsSidebar = hideContactsSidebar;
// Ajouter l'événement au bouton "+" dans votre HTML
// <i class="fa-solid fa-square-plus text-2xl text-gray-600 hover:text-black cursor-pointer" onclick="showContactsSidebar()"></i>