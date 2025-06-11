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
        <div class="fixed left-0 top-0 h-full w-16 bg-gray-100 shadow-lg flex flex-col items-center py-6 z-10">
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
                        <button id="logout-btn" class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center">
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
                    <i class="fa-solid fa-square-plus text-2xl text-gray-600 hover:text-black cursor-pointer"></i>
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

// Gestion de la déconnexion

// Chargement des conversations
async function loadConversations() {
    try {
        // Charger les données depuis l'API
        const [conversationsRes, usersRes, messagesRes] = await Promise.all([
            fetch(`${API_BASE}/conversations`),
            fetch(`${API_BASE}/users`),
            fetch(`${API_BASE}/messages`)
        ]);
        
        conversations = await conversationsRes.json();
        users = await usersRes.json();
        messages = await messagesRes.json();
        
        // Filtrer les conversations de l'utilisateur actuel
        // Convertir tous les IDs en string pour la comparaison
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
let lastMessageCheck = new Date().toISOString();


// Remplacer la fonction openConversation existante par celle-ci
function openConversation(conversationId) {
    console.log('Ouverture de la conversation:', conversationId);
    
    // Trouver la conversation
    selectedConversation = conversations.find(conv => String(conv.id) === String(conversationId));
    if (!selectedConversation) {
        console.error('Conversation non trouvée:', conversationId);
        return;
    }
    
    // Marquer la conversation comme sélectionnée visuellement
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('bg-gray-100');
    });
    document.querySelector(`[data-conversation-id="${conversationId}"]`)?.classList.add('bg-gray-100');
    
    // Charger et afficher les messages
    loadConversationMessages(conversationId);
    
    // Marquer les messages comme lus
    markConversationAsRead(conversationId);
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

// Fonction pour afficher l'interface de conversation
function displayConversationInterface() {
    const otherUser = getOtherUser(selectedConversation);
    const conversationArea = document.querySelector('.flex-1.h-full.bg-gray-100');
    
    conversationArea.innerHTML = `
        <!-- En-tête de la conversation -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between w-[1250px]">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    ${selectedConversation.isGroup 
                        ? `<i class="fas fa-users text-gray-600"></i>`
                        : `<span class="text-white font-semibold">${otherUser ? otherUser.name.charAt(0).toUpperCase() : 'U'}</span>`
                    }
                </div>
                <div>
                    <h2 class="font-semibold text-gray-900">
                        ${selectedConversation.isGroup ? selectedConversation.groupName : (otherUser ? otherUser.name : 'Utilisateur inconnu')}
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
                <i class="fas fa-video text-gray-600 text-xl cursor-pointer hover:text-green-500"></i>
                <i class="fas fa-phone text-gray-600 text-xl cursor-pointer hover:text-green-500"></i>
                <i class="fas fa-search text-gray-600 text-xl cursor-pointer hover:text-green-500"></i>
                <i class="fas fa-ellipsis-v text-gray-600 text-xl cursor-pointer hover:text-green-500"></i>
            </div>
        </div>

        <!-- Zone des messages -->
        <div class="flex-1 overflow-y-auto bg-gray-50 px-6 py-4" id="messages-container">
            ${displayMessages()}
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
    
    // Faire défiler vers le bas
    setTimeout(() => {
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

// Fonction pour afficher les messages
function displayMessages() {
    if (conversationMessages.length === 0) {
        return `
            <div class="flex items-center justify-center py-8 text-gray-500 ">
                <i class="fas fa-comments mr-2"></i>
                Aucun message dans cette conversation
            </div>
        `;
    }
    
    return conversationMessages.map(message => {
        const sender = users.find(user => String(user.id) === String(message.senderId));
        const isCurrentUser = String(message.senderId) === String(currentUser.id);
        
        return `
            <div class="mb-4 ${isCurrentUser ? 'text-right' : 'text-left'} w-[1200px]">
                <div class="inline-block max-w-xs lg:max-w-md">
                    ${!isCurrentUser && selectedConversation.isGroup ? 
                        `<p class="text-xs text-gray-500 mb-1">${sender ? sender.name : 'Utilisateur inconnu'}</p>` 
                        : ''
                    }
                    <div class="px-4 py-2 rounded-lg ${
                        isCurrentUser 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white text-gray-800 shadow-sm'
                    }">
                        <p class="text-sm">${message.content}</p>
                        <p class="text-xs mt-1 ${isCurrentUser ? 'text-green-100' : 'text-gray-500'}">
                            ${formatTime(message.timestamp)}
                            ${isCurrentUser ? 
                                `<i class="fas fa-check-double ml-1 ${message.isRead ? 'text-blue-400' : 'text-green-100'}"></i>` 
                                : ''
                            }
                        </p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
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

// Fonction pour envoyer un message
async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const content = messageInput.value.trim();
    
    if (!content || !selectedConversation) return;
    
    try {
        // Créer le nouveau message
        const newMessage = {
            id: Date.now(), // ID temporaire
            conversationId: selectedConversation.id,
            senderId: currentUser.id,
            content: content,
            timestamp: new Date().toISOString(),
            isRead: false,
            messageType: 'text'
        };
        
        // Envoyer à l'API (si disponible)
        const response = await fetch(`${API_BASE}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newMessage)
        });
        
        if (response.ok) {
            const savedMessage = await response.json();
            
            // Ajouter le message à la liste locale
            messages.push(savedMessage);
            conversationMessages.push(savedMessage);
            
            // Mettre à jour la conversation
            updateConversationLastMessage(selectedConversation.id, savedMessage.id);
            
        } else {
            // En cas d'erreur API, ajouter quand même localement
            messages.push(newMessage);
            conversationMessages.push(newMessage);
        }
        
        // Vider le champ de saisie
        messageInput.value = '';
        
        // Recharger l'affichage des messages
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.innerHTML = displayMessages();
        
        // Faire défiler vers le bas
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Mettre à jour la liste des conversations
        loadConversations();
        
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        
        // Ajouter quand même le message localement
        const newMessage = {
            id: Date.now(),
            conversationId: selectedConversation.id,
            senderId: currentUser.id,
            content: content,
            timestamp: new Date().toISOString(),
            isRead: false,
            messageType: 'text'
        };
        
        messages.push(newMessage);
        conversationMessages.push(newMessage);
        
        messageInput.value = '';
        
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.innerHTML = displayMessages();
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
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

// Fonction pour marquer une conversation comme lue
async function markConversationAsRead(conversationId) {
    try {
        const conversation = conversations.find(conv => String(conv.id) === String(conversationId));
        if (conversation && conversation.unreadCount > 0) {
            conversation.unreadCount = 0;
            
            // Mettre à jour sur le serveur
            await fetch(`${API_BASE}/conversations/${conversationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ unreadCount: 0 })
            });
            
            // Mettre à jour l'affichage
            updateUnreadCount();
            loadConversations();
        }
    } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error);
    }
}
 