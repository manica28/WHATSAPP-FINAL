
// import {  users, messages, ensureConversationProperties,addContextMenuToConversations, currentUser,  API_BASE,lastMessageCheck, newMessageConversations,pollingInterval,conversationMessages,selectedConversation} from "./main";
//  let conversations = [];

// export async function loadConversations() {
//     try {
//         const [conversationsRes, usersRes, messagesRes] = await Promise.all([
//             fetch(`${API_BASE}/conversations`),
//             fetch(`${API_BASE}/users`),
//             fetch(`${API_BASE}/messages`)
//         ]);
        
//         conversations = await conversationsRes.json();
//         users = await usersRes.json();
//         messages = await messagesRes.json();
        
//         const currentUserId = String(currentUser.id);
//         const userConversations = conversations.filter(conv => 
//             conv.participants.some(participantId => String(participantId) === currentUserId)
//         );
        
//         displayConversations(userConversations);
//         updateUnreadCount();
        
//     } catch (error) {
//         console.error('Erreur lors du chargement des conversations:', error);
//         document.getElementById('chat-list').innerHTML = `
//             <div class="flex items-center justify-center py-8 text-red-500">
//                 <i class="fas fa-exclamation-triangle mr-2"></i>
//                 Erreur de chargement
//             </div>
//         `;
//     }
    
//     ensureConversationProperties();
//     addContextMenuToConversations();
    
//     // Trier les conversations (nouvelles en premier)
//     conversations.sort((a, b) => {
//         // Prioriser les conversations avec nouveaux messages
//         const aHasNew = newMessageConversations.has(String(a.id));
//         const bHasNew = newMessageConversations.has(String(b.id));
        
//         if (aHasNew && !bHasNew) return -1;
//         if (!aHasNew && bHasNew) return 1;
        
//         // Puis par date de mise à jour
//         return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
//     });
    
//     const conversationsList = document.getElementById('conversations-list');
//     if (!conversationsList) return;
    
//     conversationsList.innerHTML = conversations.map(conversation => {
//         const otherUser = getOtherUser(conversation);
//         const lastMessage = getLastMessage(conversation);
//         const hasNewMessage = newMessageConversations.has(String(conversation.id));
//         const unreadCount = conversation.unreadCount || 0;
        
//         return `
//             <div class="conversation-item p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${hasNewMessage ? 'new-message-highlight border-l-4 border-green-500' : ''}"
//                  data-conversation-id="${conversation.id}" 
//                  onclick="openConversation('${conversation.id}')">
//                 <div class="flex items-center space-x-3">
//                     <div class="relative">
//                         <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
//                             ${conversation.isGroup 
//                                 ? `<i class="fas fa-users text-gray-600"></i>`
//                                 : `<span class="text-white font-semibold">${otherUser ? otherUser.name.charAt(0).toUpperCase() : 'U'}</span>`
//                             }
//                         </div>
//                         ${unreadCount > 0 ? 
//                             `<div class="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
//                                 ${unreadCount > 99 ? '99+' : unreadCount}
//                             </div>` 
//                             : ''
//                         }
//                     </div>
//                     <div class="flex-1 min-w-0">
//                         <div class="flex items-center justify-between">
//                             <h3 class="font-semibold text-gray-900 truncate flex items-center gap-2 ${hasNewMessage ? 'text-green-600' : ''}">
//                                 ${conversation.isGroup ? conversation.groupName : (otherUser ? otherUser.name : 'Utilisateur inconnu')}
//                                 ${hasNewMessage ? `<i class="fas fa-circle text-green-500 text-xs animate-pulse"></i>` : ''}
//                             </h3>
//                             <div class="flex items-center gap-2">
//                                 <span class="text-xs text-gray-500">
//                                     ${lastMessage ? formatTime(lastMessage.timestamp) : ''}
//                                 </span>
//                                 ${hasNewMessage ? `<i class="fas fa-bell text-green-500 text-sm animate-pulse"></i>` : ''}
//                             </div>
//                         </div>
//                         <div class="flex items-center justify-between mt-1">
//                             <p class="text-sm text-gray-600 truncate ${hasNewMessage ? 'font-bold text-green-700' : ''}">
//                                 ${lastMessage ? (lastMessage.senderId === currentUser.id ? 'Vous: ' : '') + lastMessage.content : 'Aucun message'}
//                                 ${hasNewMessage ? ` 🟢` : ''}
//                             </p>
//                             ${unreadCount > 0 ? 
//                                 `<span class="bg-gradient-to-r from-green-400 to-green-600 text-white text-xs rounded-full px-2 py-1 min-w-[24px] text-center font-bold shadow-lg animate-pulse">
//                                     ${unreadCount > 99 ? '99+' : unreadCount}
//                                 </span>` 
//                                 : ''
//                             }
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }).join('');
// }
// export function displayConversations(conversationsToShow) {
//     const chatList = document.getElementById('chat-list');
    
//     if (conversationsToShow.length === 0) {
//         chatList.innerHTML = `
//             <div class="flex items-center justify-center py-8 text-gray-500">
//                 <i class="fas fa-comments mr-2"></i>
//                 Aucune conversation
//             </div>
//         `;
//         return;
//     }
    
//     const conversationsHTML = conversationsToShow.map(conv => {
//         const otherUser = getOtherUser(conv);
//         const lastMessage = getLastMessage(conv);
        
//         return `
//             <div class="conversation-item px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100" data-conversation-id="${conv.id}">
//                 <div class="flex items-center space-x-3">
//                     <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
//                         ${conv.isGroup 
//                             ? `<i class="fas fa-users text-gray-600"></i>`
//                             : `<span class="text-white font-semibold">${otherUser ? otherUser.name.charAt(0).toUpperCase() : 'U'}</span>`
//                         }
//                     </div>
//                     <div class="flex-1 min-w-0">
//                         <div class="flex items-center justify-between">
//                             <h3 class="text-sm font-semibold text-gray-900 truncate">
//                                 ${conv.isGroup ? conv.groupName : (otherUser ? otherUser.name : 'Utilisateur inconnu')}
//                             </h3>
//                             <div class="flex items-center space-x-1">
//                                 ${conv.isPinned ? '<i class="fas fa-thumbtack text-gray-400 text-xs"></i>' : ''}
//                                 ${conv.isMuted ? '<i class="fas fa-volume-mute text-gray-400 text-xs"></i>' : ''}
//                                 <span class="text-xs text-gray-500">${formatTime(lastMessage?.timestamp)}</span>
//                             </div>
//                         </div>
//                         <div class="flex items-center justify-between mt-1">
//                             <p class="text-sm text-gray-600 truncate">
//                                 ${lastMessage ? lastMessage.content : 'Aucun message'}
//                             </p>
//                             ${conv.unreadCount > 0 ? 
//                                 `<span class="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">${conv.unreadCount}</span>` 
//                                 : ''
//                             }
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }).join('');
    
//     chatList.innerHTML = conversationsHTML;
    
//     // Ajouter les événements de clic pour chaque conversation
//     document.querySelectorAll('.conversation-item').forEach(item => {
//         item.addEventListener('click', () => {
//             const conversationId = item.dataset.conversationId;
//             openConversation(conversationId);
//         });
//     });
// }
// // Fonction pour afficher l'interface de conversation avec compteur de nouveaux messages
// function displayConversationInterface() {
//     const otherUser = getOtherUser(selectedConversation);
//     const newMessagesCount = getNewMessagesCount(selectedConversation.id);
//     const conversationArea = document.querySelector('.flex-1.h-full.bg-gray-100');
    
//     conversationArea.innerHTML = `
//         <!-- En-tête de la conversation avec compteur de nouveaux messages -->
//         <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between w-[1250px]">
//             <div class="flex items-center space-x-3">
//                 <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center relative">
//                     ${selectedConversation.isGroup 
//                         ? `<i class="fas fa-users text-gray-600"></i>`
//                         : `<span class="text-white font-semibold">${otherUser ? otherUser.name.charAt(0).toUpperCase() : 'U'}</span>`
//                     }
//                     ${newMessagesCount > 0 ? 
//                         `<div class="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
//                             ${newMessagesCount > 9 ? '9+' : newMessagesCount}
//                         </div>` 
//                         : ''
//                     }
//                 </div>
//                 <div>
//                     <h2 class="font-semibold text-gray-900 flex items-center gap-2">
//                         ${selectedConversation.isGroup ? selectedConversation.groupName : (otherUser ? otherUser.name : 'Utilisateur inconnu')}
//                         ${newMessagesCount > 0 ? 
//                             `<span class="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
//                                 ${newMessagesCount} nouveau${newMessagesCount > 1 ? 'x' : ''} message${newMessagesCount > 1 ? 's' : ''}
//                             </span>` 
//                             : ''
//                         }
//                     </h2>
//                     <p class="text-sm text-gray-500">
//                         ${selectedConversation.isGroup 
//                             ? `${selectedConversation.participants.length} participants`
//                             : (otherUser ? `Dernière connexion ${formatTime(otherUser.lastSeen)}` : 'Hors ligne')
//                         }
//                     </p>
//                 </div>
//             </div>
//             <div class="flex items-center space-x-4">
//                 ${newMessagesCount > 0 ? 
//                     `<button onclick="markAllMessagesAsRead('${selectedConversation.id}')" 
//                              class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors">
//                         Tout marquer comme lu
//                     </button>` 
//                     : ''
//                 }
//                 <i class="fas fa-video text-gray-600 text-xl cursor-pointer hover:text-green-500"></i>
//                 <i class="fas fa-phone text-gray-600 text-xl cursor-pointer hover:text-green-500"></i>
//                 <i class="fas fa-search text-gray-600 text-xl cursor-pointer hover:text-green-500"></i>
//                 <i class="fas fa-ellipsis-v text-gray-600 text-xl cursor-pointer hover:text-green-500"></i>
//             </div>
//         </div>

//         <!-- Zone des messages avec section nouveaux messages -->
//         <div class="flex-1 overflow-y-auto bg-gray-50 px-6 py-4" id="messages-container">
//             ${displayMessagesWithNewSection()}
//         </div>

//         <!-- Zone de saisie -->
//         <div class="bg-white border-t border-gray-200 px-6 py-4">
//             <div class="flex items-center space-x-3">
//                 <i class="fas fa-smile text-gray-500 text-xl cursor-pointer hover:text-green-500"></i>
//                 <i class="fas fa-paperclip text-gray-500 text-xl cursor-pointer hover:text-green-500"></i>
//                 <div class="flex-1 relative w-[1070px]">
//                     <input 
//                         type="text" 
//                         id="message-input"
//                         placeholder="Tapez un message"
//                         class="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-green-500"
//                     >
//                 </div>
//                 <i class="fas fa-microphone text-gray-500 text-xl cursor-pointer hover:text-green-500"></i>
//                 <button id="send-btn" class="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors">
//                     <i class="fas fa-paper-plane"></i>
//                 </button>
//             </div>
//         </div>
//     `;
    
//     // Ajouter les événements
//     setupConversationEvents();
    
//     // Faire défiler vers le bas ou vers les nouveaux messages
//     setTimeout(() => {
//         const messagesContainer = document.getElementById('messages-container');
//         const newMessagesSection = document.getElementById('new-messages-section');
        
//         if (newMessagesSection && newMessagesCount > 0) {
//             // Faire défiler vers la section des nouveaux messages
//             newMessagesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
//         } else {
//             // Faire défiler vers le bas
//             messagesContainer.scrollTop = messagesContainer.scrollHeight;
//         }
//     }, 100);
// }
// // Fonction pour marquer tous les messages comme lus
// async function markAllMessagesAsRead(conversationId) {
//     try {
//         // Marquer la conversation comme lue
//         await markConversationAsRead(conversationId);
        
//         // Rafraîchir l'interface
//         displayConversationInterface();
        
//         // Notification de succès
//         showNotification('Tous les messages ont été marqués comme lus', 'success');
        
//     } catch (error) {
//         console.error('Erreur lors du marquage comme lu:', error);
//         showNotification('Erreur lors du marquage comme lu', 'error');
//     }
// }
// // Fonction pour afficher les messages avec indication des nouveaux messages
// // Fonction pour afficher les messages avec section spéciale pour les nouveaux messages
// function displayMessagesWithNewSection() {
//     if (conversationMessages.length === 0) {
//         return `
//             <div class="flex items-center justify-center py-8 text-gray-500">
//                 <i class="fas fa-comments mr-2"></i>
//                 Aucun message dans cette conversation
//             </div>
//         `;
//     }
    
//     // Séparer les messages en anciens et nouveaux
//     const newMessages = conversationMessages.filter(msg => 
//         String(msg.senderId) !== String(currentUser.id) && 
//         isNewMessage(msg)
//     );
    
//     const oldMessages = conversationMessages.filter(msg => !isNewMessage(msg) || String(msg.senderId) === String(currentUser.id));
    
//     let html = '';
    
//     // Afficher les anciens messages
//     html += oldMessages.map(message => renderMessage(message, false)).join('');
    
//     // Afficher la section des nouveaux messages si il y en a
//     if (newMessages.length > 0) {
//         html += `
//             <div id="new-messages-section" class="my-6">
//                 <!-- Séparateur pour nouveaux messages -->
//                 <div class="flex items-center justify-center my-4">
//                     <div class="flex-1 h-px bg-green-300"></div>
//                     <div class="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
//                         <i class="fas fa-arrow-down mr-2"></i>
//                         ${newMessages.length} nouveau${newMessages.length > 1 ? 'x' : ''} message${newMessages.length > 1 ? 's' : ''}
//                         <i class="fas fa-arrow-down ml-2"></i>
//                     </div>
//                     <div class="flex-1 h-px bg-green-300"></div>
//                 </div>
                
//                 <!-- Messages nouveaux avec effet spécial -->
//                 <div class="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200 shadow-lg">
//                     ${newMessages.map((message, index) => renderMessage(message, true, index)).join('')}
//                 </div>
//             </div>
//         `;
//     }
    
//     return html;
// }

// // Fonction pour envoyer un message (mise à jour)
// async function sendMessage() {
//     const messageInput = document.getElementById('message-input');
//     const content = messageInput.value.trim();
    
//     if (!content || !selectedConversation) return;
    
//     try {
//         // Créer le nouveau message
//         const newMessage = {
//             id: Date.now(),
//             conversationId: selectedConversation.id,
//             senderId: currentUser.id,
//             content: content,
//             timestamp: new Date().toISOString(),
//             isRead: false,
//             messageType: 'text'
//         };
        
//         // Envoyer à l'API (si disponible)
//         const response = await fetch(`${API_BASE}/messages`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(newMessage)
//         });
        
//         if (response.ok) {
//             const savedMessage = await response.json();
//             messages.push(savedMessage);
//             conversationMessages.push(savedMessage);
//             updateConversationLastMessage(selectedConversation.id, savedMessage.id);
//         } else {
//             messages.push(newMessage);
//             conversationMessages.push(newMessage);
//         }
        
//         // Vider le champ de saisie
//         messageInput.value = '';
        
//         // Recharger l'affichage
//         displayConversationInterface();
//         loadConversations();
        
//     } catch (error) {
//         console.error('Erreur lors de l\'envoi du message:', error);
        
//         const newMessage = {
//             id: Date.now(),
//             conversationId: selectedConversation.id,
//             senderId: currentUser.id,
//             content: content,
//             timestamp: new Date().toISOString(),
//             isRead: false,
//             messageType: 'text'
//         };
        
//         messages.push(newMessage);
//         conversationMessages.push(newMessage);
//         messageInput.value = '';
//         displayConversationInterface();
//     }
// }

// // Fonction pour mettre à jour le dernier message d'une conversation
// async function updateConversationLastMessage(conversationId, messageId) {
//     try {
//         let conversation = conversations.find(conv => String(conv.id) === String(conversationId));
//         if (conversation) {
//             conversation.lastMessageId = messageId;
            
//             // Mettre à jour sur le serveur
//             await fetch(`${API_BASE}/conversations/${conversationId}`, {
//                 method: 'PATCH',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ lastMessageId: messageId })
//             });
//         }
//     } catch (error) {
//         console.error('Erreur lors de la mise à jour de la conversation:', error);
//     }
// }



// // Fonction pour démarrer le polling des nouveaux messages
// function startMessagePolling() {
//     // Vérifier les nouveaux messages toutes les 2 secondes
//     pollingInterval = setInterval(checkForNewMessages, 2000);
// }

// // Fonction pour arrêter le polling
// function stopMessagePolling() {
//     if (pollingInterval) {
//         clearInterval(pollingInterval);
//         pollingInterval = null;
//     }
// }

// // Fonction pour vérifier les nouveaux messages
// async function checkForNewMessages() {
//     try {
//         const response = await fetch(`${API_BASE}/messages?since=${lastMessageCheck}`);
//         if (response.ok) {
//             const newMessages = await response.json();
            
//             if (newMessages.length > 0) {
//                 // Traiter chaque nouveau message
//                 newMessages.forEach(message => {
//                     handleNewMessage(message);
//                 });
                
//                 // Mettre à jour le timestamp de vérification
//                 lastMessageCheck = new Date().toISOString();
//             }
//         }
//     } catch (error) {
//         console.error('Erreur lors de la vérification des nouveaux messages:', error);
//     }
// }
// // Fonction pour rendre un message individuel
// function renderMessage(message, isNew = false, newIndex = 0) {
//     const sender = users.find(user => String(user.id) === String(message.senderId));
//     const isCurrentUser = String(message.senderId) === String(currentUser.id);
    
//     return `
//         <div class="mb-4 ${isCurrentUser ? 'text-right' : 'text-left'} w-[1200px] ${isNew ? 'new-message-animation' : ''}" 
//              style="${isNew ? `animation-delay: ${newIndex * 0.2}s` : ''}">
//             <div class="inline-block max-w-xs lg:max-w-md">
//                 ${!isCurrentUser && selectedConversation.isGroup ? 
//                     `<p class="text-xs ${isNew ? 'text-green-600 font-bold' : 'text-gray-500'} mb-1">
//                         ${sender ? sender.name : 'Utilisateur inconnu'}
//                         ${isNew ? ' • NOUVEAU' : ''}
//                     </p>` 
//                     : ''
//                 }
//                 <div class="px-4 py-2 rounded-lg relative ${
//                     isCurrentUser 
//                         ? 'bg-green-500 text-white' 
//                         : isNew 
//                             ? 'bg-gradient-to-r from-green-200 to-green-300 text-gray-800 shadow-lg border-2 border-green-400 new-message-bubble'
//                             : 'bg-white text-gray-800 shadow-sm'
//                 }">
//                     ${isNew && !isCurrentUser ? 
//                         `<div class="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
//                             !
//                         </div>` 
//                         : ''
//                     }
//                     <p class="text-sm ${isNew && !isCurrentUser ? 'font-semibold' : ''}">${message.content}</p>
//                     <p class="text-xs mt-1 ${
//                         isCurrentUser 
//                             ? 'text-green-100' 
//                             : isNew 
//                                 ? 'text-green-700 font-bold' 
//                                 : 'text-gray-500'
//                     }">
//                         ${formatTime(message.timestamp)}
//                         ${isCurrentUser ? 
//                             `<i class="fas fa-check-double ml-1 ${message.isRead ? 'text-blue-400' : 'text-green-100'}"></i>` 
//                             : ''
//                         }
//                         ${isNew && !isCurrentUser ? `<span class="ml-2 text-green-600 font-bold animate-pulse">• NOUVEAU •</span>` : ''}
//                     </p>
//                 </div>
//             </div>
//         </div>
//     `; 
// }

// // Fonction pour vérifier si un message est nouveau
// function isNewMessage(message) {
//     return newMessageConversations.has(String(message.conversationId)) && 
//            String(message.senderId) !== String(currentUser.id) &&
//            // Messages des 5 dernières minutes considérés comme nouveaux
//            (new Date() - new Date(message.timestamp)) < 5 * 60 * 1000;
// }

// // Fonction pour obtenir le nombre de nouveaux messages dans une conversation
// function getNewMessagesCount(conversationId) {
//     return conversationMessages.filter(msg => 
//         String(msg.conversationId) === String(conversationId) &&
//         String(msg.senderId) !== String(currentUser.id) && 
//         isNewMessage(msg)
//     ).length;
// }

// /// Fonction pour traiter un nouveau message (mise à jour)
// function handleNewMessage(message) {
//     const existingMessage = messages.find(m => String(m.id) === String(message.id));
//     if (existingMessage) return;
    
//     messages.push(message);
    
//     if (String(message.senderId) !== String(currentUser.id)) {
//         // Marquer la conversation comme ayant un nouveau message
//         newMessageConversations.add(String(message.conversationId));
        
//         // Mettre à jour le compteur
//         updateConversationUnreadCount(message.conversationId);
        
//         // Si la conversation est ouverte, mettre à jour l'affichage
//         if (selectedConversation && String(selectedConversation.id) === String(message.conversationId)) {
//             conversationMessages.push(message);
//             displayConversationInterface();
            
//             // Son de notification
//             playNotificationSound();
            
//             // Notification système
//             showNotification(`Nouveau message de ${getUserName(message.senderId)}`, 'info');
//         }
        
//         // Mettre à jour la liste des conversations
//         moveConversationToTop(message.conversationId);
//         highlightNewMessageConversation(message.conversationId);
//     }
    
//     loadConversations();
// }
// // Fonction utilitaire pour obtenir le nom d'un utilisateur
// function getUserName(userId) {
//     const user = users.find(u => String(u.id) === String(userId));
//     return user ? user.name : 'Utilisateur inconnu';
// }


// async function updateConversationUnreadCount(conversationId) {
//     const conversation = conversations.find(conv => String(conv.id) === String(conversationId));
//     if (conversation) {
//         conversation.unreadCount = (conversation.unreadCount || 0) + 1;
//         conversation.lastMessageId = messages[messages.length - 1].id;
//         conversation.updatedAt = new Date().toISOString();

//         // Mettre à jour sur le serveur pour que le badge reste après reload
//         try {
//             await fetch(`${API_BASE}/conversations/${conversationId}`, {
//                 method: 'PATCH',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ 
//                     unreadCount: conversation.unreadCount,
//                     lastMessageId: conversation.lastMessageId,
//                     updatedAt: conversation.updatedAt
//                 })
//             });
//         } catch (e) {
//             console.error('Erreur update unreadCount:', e);
//         }
//     }
// }
// // Fonction pour faire remonter une conversation en haut
// function moveConversationToTop(conversationId) {
//     const conversationIndex = conversations.findIndex(conv => String(conv.id) === String(conversationId));
//     if (conversationIndex > -1) {
//         // Retirer la conversation de sa position actuelle
//         const conversation = conversations.splice(conversationIndex, 1)[0];
        
//         // Mettre à jour le timestamp pour le tri
//         conversation.updatedAt = new Date().toISOString();
        
//         // L'ajouter en première position
//         conversations.unshift(conversation);
//     }
// }
// // Fonction pour mettre en surbrillance une conversation avec nouveau message
// function highlightNewMessageConversation(conversationId) {
//     setTimeout(() => {
//         const conversationElement = document.querySelector(`[data-conversation-id="${conversationId}"]`);
//         if (conversationElement) {
//             // Ajouter l'effet de surbrillance verte
//             conversationElement.classList.add('new-message-highlight');
            
//             // Animation de pulsation
//             conversationElement.style.animation = 'newMessagePulse 0.8s ease-in-out 3';
            
//             // Retirer l'animation après un délai
//             setTimeout(() => {
//                 conversationElement.style.animation = '';
//             }, 2400); // 0.8s * 3 répétitions
//         }
//     }, 100);
// }

// // Fonction pour rafraîchir l'affichage des messages dans la conversation ouverte
// function refreshMessagesDisplay() {
//     const messagesContainer = document.getElementById('messages-container');
//     if (messagesContainer && selectedConversation) {
//         // Sauvegarder la position de scroll
//         const wasAtBottom = messagesContainer.scrollTop >= messagesContainer.scrollHeight - messagesContainer.clientHeight - 50;
        
//         // Mettre à jour l'affichage
//         messagesContainer.innerHTML = displayMessages();
        
//         // Si l'utilisateur était en bas, rester en bas
//         if (wasAtBottom) {
//             messagesContainer.scrollTop = messagesContainer.scrollHeight;
//         }
//     }
// }



// // Fonction pour jouer un son de notification (optionnel)
// function playNotificationSound() {
//     try {
//         const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiN0fPReiwGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYSQ0SW7Ps7KpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKYHAUTWrLu7qpYFAlBmdrvxmUcBzqJ0fLRfywGJHfD8OKY==');
//         audio.volume = 0.3;
//         audio.play().catch(e => console.log('Impossible de jouer le son:', e));
//     } catch (error) {
//         console.log('Audio non supporté');
//     }
// }

// // Fonction pour ouvrir une conversation
// function openConversation(conversationId) {
//     console.log('Ouverture de la conversation:', conversationId);
    
//     // Trouver la conversation
//     selectedConversation = conversations.find(conv => String(conv.id) === String(conversationId));
//     if (!selectedConversation) {
//         console.error('Conversation non trouvée:', conversationId);
//         return;
//     }
    
//     // Marquer la conversation comme sélectionnée visuellement
//     document.querySelectorAll('.conversation-item').forEach(item => {
//         item.classList.remove('bg-gray-100', 'new-message-highlight');
//     });
//     document.querySelector(`[data-conversation-id="${conversationId}"]`)?.classList.add('bg-gray-100');
    
//     // Charger et afficher les messages
//     loadConversationMessages(conversationId);
    
//     // Marquer les messages comme lus après un délai pour voir l'effet vert
//     setTimeout(() => {
//         markConversationAsRead(conversationId);
//     }, 2000);
// }

// // Fonction pour charger les messages d'une conversation
// async function loadConversationMessages(conversationId) {
//     try {
//         // Filtrer les messages de cette conversation
//         conversationMessages = messages.filter(msg => String(msg.conversationId) === String(conversationId));
        
//         // Trier par timestamp
//         conversationMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
//         // Afficher l'interface de conversation
//         displayConversationInterface();
        
//     } catch (error) {
//         console.error('Erreur lors du chargement des messages:', error);
//     }
// }


// // Configuration des événements de la conversation
// function setupConversationEvents() {
//     const messageInput = document.getElementById('message-input');
//     const sendBtn = document.getElementById('send-btn');
    
//     // Envoyer message avec Enter
//     messageInput.addEventListener('keypress', (e) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//             e.preventDefault();
//             sendMessage();
//         }
//     });
    
//     // Envoyer message avec le bouton
//     sendBtn.addEventListener('click', sendMessage);
// }

// // Fonction pour marquer une conversation comme lue (mise à jour)
// async function markConversationAsRead(conversationId) {
//     try {
//         const conversation = conversations.find(conv => String(conv.id) === String(conversationId));
//         if (conversation && conversation.unreadCount > 0) {
//             conversation.unreadCount = 0;
            
//             // Retirer de la liste des nouvelles conversations
//             newMessageConversations.delete(String(conversationId));
            
//             // Mettre à jour sur le serveur
//             await fetch(`${API_BASE}/conversations/${conversationId}`, {
//                 method: 'PATCH',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ unreadCount: 0 })
//             });
            
//             // Mettre à jour l'affichage
//             updateUnreadCount();
//             loadConversations();
            
//             // Si c'est la conversation ouverte, rafraîchir
//             if (selectedConversation && String(selectedConversation.id) === String(conversationId)) {
//                 displayConversationInterface();
//             }
//         }
//     } catch (error) {
//         console.error('Erreur lors du marquage comme lu:', error);
//     }
// }

// // Fonction de nettoyage à appeler lors de la fermeture de l'application
// function cleanupMessageSystem() {
//     stopMessagePolling();
// }

// // Appeler l'initialisation au chargement
// document.addEventListener('DOMContentLoaded', initializeMessageSystem);

// // Nettoyer lors de la fermeture
// window.addEventListener('beforeunload', cleanupMessageSystem);
// // Styles CSS améliorés
// function initializeMessageSystem() {
//     startMessagePolling();
    
//     const style = document.createElement('style');
//     style.textContent = `
//         /* Conversations avec nouveaux messages */
//         .new-message-highlight {
//             background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
//             border-left: 4px solid #22c55e !important;
//             box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3) !important;
//             transform: scale(1.01);
//         }
        
//         .new-message-highlight:hover {
//             background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%) !important;
//             transform: scale(1.02);
//         }
        
//         /* Messages nouveaux */
//         .new-message-bubble {
//             background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%) !important;
//             border: 2px solid #22c55e !important;
//             box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4) !important;
//             transform: scale(1.02);
//         }
        
//         .new-message-animation {
//             animation: slideInGreen 0.6s ease-out, pulseGreen 3s ease-in-out infinite;
//         }
        
//         @keyframes slideInGreen {
//             0% {
//                 transform: translateX(-30px) scale(0.95);
//                 opacity: 0;
//             }
//             100% {
//                 transform: translateX(0) scale(1);
//                 opacity: 1;
//             }
//         }
        
//         @keyframes pulseGreen {
//             0%, 100% {
//                 box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
//             }
//             50% {
//                 box-shadow: 0 0 24px rgba(34, 197, 94, 0.8);
//             }
//         }
        
//         /* Séparateur animé */
//         #new-messages-section {
//             animation: fadeInUp 0.5s ease-out;
//         }
        
//         @keyframes fadeInUp {
//             0% {
//                 transform: translateY(20px);
//                 opacity: 0;
//             }
//             100% {
//                 transform: translateY(0);
//                 opacity: 1;
//             }
//         }
        
//         /* Notifications flottantes */
//         .notification-enter {
//             transform: translateX(100%);
//             opacity: 0;
//         }
        
//         .notification-enter-active {
//             transform: translateX(0);
//             opacity: 1;
//             transition: all 0.3s ease-out;
//         }
        
//         /* Compteurs de messages */
//         .message-counter {
//             background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
//             box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
//         }
//     `;
//     document.head.appendChild(style);
// }


// // Initialisation
// document.addEventListener('DOMContentLoaded', initializeMessageSystem);
// window.addEventListener('beforeunload', cleanupMessageSystem);