// === FONCTIONS DE VALIDATION ===

export function NomInput(input) 
{
    return input.id.charAt(0).toUpperCase() + input.id.slice(1);
}

// :::::::::::::::::::::::::::::::::::::::::::::::::::::: Gérer les messages de succès avec Tailwind

export function messageSucces(input) 
{
    const elementParent = input.parentElement;
    
    // Retirer les classes d'erreur et ajouter les classes de succès
    input.classList.remove('border-l-4', 'border-l-red-500', 'focus:border-l-red-500');
    input.classList.add('border-green-500', 'focus:border-green-500');
    
    // Cacher le message d'erreur
    const small = elementParent.querySelector("small");
    if (small) 
    {
        small.classList.add('hidden');
    }
}

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::  Gérer les messages d'erreurs avec Tailwind

export function messageError(input, message) 
{
    const elementParent = input.parentElement;
    
    // Retirer les classes de succès et ajouter les classes d'erreur
    input.classList.remove('border-green-500', 'focus:border-green-500');
    input.classList.add('border-l-4', 'border-l-red-500', 'focus:border-l-red-500');

    
    // Afficher le message d'erreur
    const small = elementParent.querySelector("small");
    if (small) 
    {
        small.innerText = message;
        small.classList.remove('hidden');
        small.classList.add('text-red-500', 'text-sm', 'mt-1');
    }
}

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

export function checkLenght(input, min, max) 
{
    if (input.value.trim().length < min) 
    {
        messageError(input, `${NomInput(input)} est inférieur à ${min} caractères`);
        return false;
    }
    else if (input.value.trim().length > max) {
        messageError(input, `${NomInput(input)} est supérieur à ${max} caractères`);
        return false;
    } 
    else {
        messageSucces(input);
        return true;
    }
}

//  ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

export function checkRequired(inputs) 
{
    let valid = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            messageError(input, `${NomInput(input)} est requis`);
            valid = false;
        } 
        else {
            messageSucces(input);
        }
    });
    return valid;
}

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: Validation spéciale pour le téléphone

export function checkPhone(input) 
{
    const phoneValue = input.value.trim();
    const normalizedPhone = normalizePhone(phoneValue);
    
    if (normalizedPhone.length < 9) {
        messageError(input, "Numéro de téléphone trop court");
        return false;
    }
    else if (normalizedPhone.length > 15) {
        messageError(input, "Numéro de téléphone trop long");
        return false;
    }
    else {
        messageSucces(input);
        return true;
    }
}

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: Fonction principale de validation pour la connexion

export function validerChamps() 
{
    const phone = document.getElementById('phone');
    const code = document.getElementById('code');
    
    let isValid = true;
    
    // Vérifier si tous les champs sont remplis
    if (!checkRequired([phone, code])) {
        isValid = false;
    }
    
    // Vérifier le téléphone
    if (!checkPhone(phone)) {
        isValid = false;
    }
    
    // Vérifier la longueur du code (4 à 8 caractères)
    if (!checkLenght(code, 4, 8)) {
        isValid = false;
    }
    
    return isValid;
}

// === FONCTIONS DE TÉLÉPHONE ===

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: Fonction simple de normalisation du numéro de téléphone

export function normalizePhone(phone) 
{
    // Enlever tout sauf les chiffres
    let digits = phone.replace(/\D/g, '');
    
    // Si commence par 00, enlever les 00
    if (digits.startsWith('00')) {
        digits = digits.slice(2);
    }
    
    // Si commence par 0 (numéro local), ajouter 221 pour le Sénégal
    if (digits.startsWith('0')) {
        digits = '221' + digits.slice(1);
    }
    
    // Si seulement 9 chiffres, ajouter 221 (Sénégal par défaut)
    if (digits.length === 9) {
        digits = '221' + digits;
    }
    
    return digits;
}