   // Configuration de l'URL du serveur JSON
        const API_BASE_URL = 'http://localhost:3001';
        const CURRENT_USER_ID = 1; // ID de l'utilisateur connecté (Awa)
        
        let chatsData = [];
        let filteredChats = [];
        let currentFilter = 'all';
        let users = [];
        let conversations = [];
        let messages = [];

        // Fonction pour récupérer toutes les données depuis le serveur JSON
        async function fetchAllData() {
            try {
                const [usersResponse, conversationsResponse, messagesResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/users`),
                    fetch(`${API_BASE_URL}/conversations`),
                    fetch(`${API_BASE_URL}/messages`)
                ]);

                if (!usersResponse.ok || !conversationsResponse.ok || !messagesResponse.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }

                users = await usersResponse.json();
                conversations = await conversationsResponse.json();
                messages = await messagesResponse.json();

                return processConversationsData();
            } catch (error) {
                console.error('Erreur:', error);
                // Données de fallback en cas d'erreur
                return [
                    {
                        id: 1,
                        name: "Moussa",
                        avatar: { type: "text", content: "M", bgColor: "bg-blue-500" },
                        lastMessage: "Salut Awa, ça va ?",
                        time: "10:01",
                        unreadCount: 0,
                        isActive: false,
                        isMuted: false,
                        hasStatus: false,
                        messageType: "text",
                        isGroup: false
                    }
                ];
            }
        }

        // Fonction pour traiter les données et créer les objets de chat
        function processConversationsData() {
            return conversations.map(conversation => {
                // Trouver le dernier message
                const lastMessage = messages.find(msg => msg.id === conversation.lastMessageId);
                
                // Déterminer le nom et l'avatar
                let chatName, avatar, isGroup = false;
                
                if (conversation.isGroup) {
                    chatName = conversation.groupName;
                    avatar = {
                        type: "text",
                        content: chatName.substring(0, 2).toUpperCase(),
                        bgColor: "bg-purple-500"
                    };
                    isGroup = true;
                } else {
                    // Conversation privée - trouver l'autre participant
                    const otherUserId = conversation.participants.find(id => id !== CURRENT_USER_ID);
                    const otherUser = users.find(user => user.id === otherUserId);
                    
                    chatName = otherUser ? otherUser.name : "Utilisateur inconnu";
                    avatar = {
                        type: "text",
                        content: chatName.substring(0, 1).toUpperCase(),
                        bgColor: getAvatarColor(otherUserId)
                    };
                }

                // Compter les messages non lus
                const unreadCount = messages.filter(msg => 
                    msg.conversationId === conversation.id && 
                    !msg.isRead && 
                    msg.senderId !== CURRENT_USER_ID
                ).length;

                // Formater le message et l'heure
                let displayMessage = "Aucun message";
                let displayTime = "";
                let isFromMe = false;

                if (lastMessage) {
                    displayMessage = lastMessage.content;
                    displayTime = formatTime(lastMessage.timestamp);
                    isFromMe = lastMessage.senderId === CURRENT_USER_ID;
                    
                    if (isFromMe) {
                        displayMessage = "Moi: " + displayMessage;
                    }
                }

                return {
                    id: conversation.id,
                    name: chatName,
                    avatar: avatar,
                    lastMessage: displayMessage,
                    time: displayTime,
                    unreadCount: unreadCount,
                    isActive: false,
                    isMuted: conversation.isMuted,
                    hasStatus: false, // Peut être ajouté plus tard
                    messageType: "text",
                    isFromMe: isFromMe,
                    isGroup: isGroup,
                    isArchived: conversation.isArchived
                };
            }).filter(chat => !chat.isArchived); // Exclure les conversations archivées
        }

        // Fonction pour obtenir une couleur d'avatar basée sur l'ID utilisateur
        function getAvatarColor(userId) {
            const colors = [
                "bg-blue-500", "bg-green-500", "bg-red-500", 
                "bg-yellow-500", "bg-purple-500", "bg-pink-500",
                "bg-indigo-500", "bg-orange-500"
            ];
            return colors[userId % colors.length];
        }

        // Fonction pour formater l'heure
        function formatTime(timestamp) {
            const messageDate = new Date(timestamp);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
            
            if (messageDay.getTime() === today.getTime()) {
                // Aujourd'hui - afficher l'heure
                return messageDate.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            } else if (messageDay.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
                // Hier
                return "hier";
            } else {
                // Date plus ancienne
                return messageDate.toLocaleDateString('fr-FR', { 
                    day: '2-digit', 
                    month: '2-digit' 
                });
            }
        }

        // Fonction pour générer le HTML d'un élément de chat
        function generateChatItemHTML(chat) {
            const activeClass = chat.isActive ? 'chat-active' : '';
            const timeColor = chat.unreadCount > 0 ? 'text-green-500' : 'text-gray-500';
            
            const avatarContent = chat.avatar.type === 'emoji' 
                ? `<span class="text-white font-bold text-lg">${chat.avatar.content}</span>`
                : `<span class="text-white font-bold">${chat.avatar.content}</span>`;

            const statusBadge = chat.hasStatus 
                ? `<div class="absolute -bottom-1 -right-1">
                     <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                         <i class="fas fa-check text-white text-xs"></i>
                     </div>
                   </div>`
                : '';

            const messageIcon = chat.messageType === 'voice' 
                ? '<i class="fas fa-microphone text-gray-400 text-xs"></i>' 
                : '';

            const unreadBadge = chat.unreadCount > 0 
                ? `<div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                     <span class="text-white text-xs">${chat.unreadCount}</span>
                   </div>`
                : '';

            const muteIcon = chat.isMuted 
                ? '<i class="fas fa-volume-mute text-gray-400 text-sm"></i>' 
                : '';

            // Ajouter une icône pour les groupes
            const groupIcon = chat.isGroup 
                ? '<i class="fas fa-users text-gray-400 text-xs mr-1"></i>' 
                : '';

            return `
                <div class="chat-item px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 ${activeClass}" data-chat-id="${chat.id}">
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <div class="w-12 h-12 ${chat.avatar.bgColor} rounded-full flex items-center justify-center">
                                ${avatarContent}
                            </div>
                            ${statusBadge}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-center">
                                <div class="flex items-center">
                                    ${groupIcon}
                                    <h3 class="font-semibold text-gray-900 truncate">${chat.name}</h3>
                                </div>
                                <span class="text-xs ${timeColor}">${chat.time}</span>
                            </div>
                            <div class="flex items-center gap-1">
                                ${messageIcon}
                                <p class="text-sm text-gray-600 truncate">${chat.lastMessage}</p>
                            </div>
                        </div>
                        <div class="flex flex-col items-end gap-1">
                            ${muteIcon}
                            ${unreadBadge}
                        </div>
                    </div>
                </div>
            `;
        }

        // Fonction pour afficher les chats
        function renderChats(chats) {
            const chatList = document.getElementById('chat-list');
            
            if (chats.length === 0) {
                chatList.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-8 text-gray-500">
                        <i class="fas fa-comments text-4xl mb-4"></i>
                        <p>Aucune discussion trouvée</p>
                    </div>
                `;
                return;
            }

            chatList.innerHTML = chats.map(chat => generateChatItemHTML(chat)).join('');
            
            // Ajouter les événements de clic
            chatList.querySelectorAll('.chat-item').forEach(item => {
                item.addEventListener('click', () => {
                    const chatId = item.dataset.chatId;
                    selectChat(chatId);
                });
            });
        }

        // Fonction pour sélectionner un chat
        function selectChat(chatId) {
            // Retirer la classe active de tous les chats
            document.querySelectorAll('.chat-item').forEach(item => {
                item.classList.remove('chat-active');
            });
            
            // Ajouter la classe active au chat sélectionné
            const selectedChat = document.querySelector(`[data-chat-id="${chatId}"]`);
            if (selectedChat) {
                selectedChat.classList.add('chat-active');
            }
            
            // Marquer les messages comme lus
            markMessagesAsRead(parseInt(chatId));
            
            console.log(`Conversation sélectionnée: ${chatId}`);
        }

        // Fonction pour filtrer les chats
        function filterChats(filter) {
            let filtered = [];
            
            switch (filter) {
                case 'unread':
                    filtered = chatsData.filter(chat => chat.unreadCount > 0);
                    break;
                case 'favorites':
                    // Supposons qu'il y ait une propriété isFavorite (à ajouter plus tard)
                    filtered = chatsData.filter(chat => chat.isFavorite);
                    break;
                case 'groups':
                    filtered = chatsData.filter(chat => chat.isGroup);
                    break;
                default:
                    filtered = [...chatsData];
            }
            
            filteredChats = filtered;
            renderChats(filteredChats);
        }

        // Fonction pour rechercher dans les chats
        function searchChats(query) {
            const searchTerm = query.toLowerCase().trim();
            
            if (searchTerm === '') {
                filterChats(currentFilter);
                return;
            }
            
            const searchResults = filteredChats.filter(chat => 
                chat.name.toLowerCase().includes(searchTerm) ||
                chat.lastMessage.toLowerCase().includes(searchTerm)
            );
            
            renderChats(searchResults);
        }

        // Fonction pour mettre à jour les compteurs
        function updateCounters() {
            const totalUnread = chatsData.reduce((sum, chat) => sum + chat.unreadCount, 0);
            document.getElementById('total-unread-badge').textContent = totalUnread;
            
            // Compter les conversations archivées
            const archivedCount = conversations.filter(conv => conv.isArchived).length;
            document.getElementById('archived-count').textContent = archivedCount;
        }

        // Fonction pour marquer les messages comme lus
        async function markMessagesAsRead(conversationId) {
            try {
                const conversationMessages = messages.filter(msg => 
                    msg.conversationId === conversationId && 
                    msg.senderId !== CURRENT_USER_ID && 
                    !msg.isRead
                );

                // Mettre à jour localement
                conversationMessages.forEach(msg => {
                    msg.isRead = true;
                });

                // Mettre à jour sur le serveur (si nécessaire)
                for (const message of conversationMessages) {
                    await fetch(`${API_BASE_URL}/messages/${message.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ isRead: true })
                    });
                }

                // Rafraîchir l'affichage
                chatsData = processConversationsData();
                renderChats(filteredChats);
                updateCounters();
            } catch (error) {
                console.error('Erreur lors de la mise à jour des messages:', error);
            }
        }

        // Fonction d'initialisation
        async function initializeApp() {
            try {
                chatsData = await fetchAllData();
                filteredChats = [...chatsData];
                renderChats(filteredChats);
                updateCounters();
                
            } catch (error) {
                console.error('Erreur lors de l\'initialisation:', error);
            }
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', () => {
            initializeApp();
            
            // Gestion des onglets de filtre
            document.querySelectorAll('.filter-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    // Retirer la classe active de tous les onglets
                    document.querySelectorAll('.filter-tab').forEach(t => {
                        t.classList.remove('bg-green-100', 'text-green-600', 'font-medium');
                        t.classList.add('bg-gray-100', 'text-gray-600');
                    });
                    
                    // Ajouter la classe active à l'onglet cliqué
                    e.target.classList.remove('bg-gray-100', 'text-gray-600');
                    e.target.classList.add('bg-green-100', 'text-green-600', 'font-medium');
                    
                    currentFilter = e.target.dataset.filter;
                    filterChats(currentFilter);
                });
            });
            // Gestion de la recherche
            const searchInput = document.getElementById('search-input');
            searchInput.addEventListener('input', (e) => {
                searchChats(e.target.value);
            });
        });
        // Fonction pour rafraîchir les données (optionnelle)
        function refreshChats() {
            initializeApp();
        }
        // Rafraîchir automatiquement toutes les 30 secondes pour une expérience plus réactive
        setInterval(refreshChats, 30 * 1000);