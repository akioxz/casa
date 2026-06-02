import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, THEME } from '../constants/theme';
import Constants from 'expo-constants';

export const AIAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ id: string; text: string; sender: 'user' | 'ai' }[]>([
    { id: '1', text: 'Hello! I am your Casa AI Assistant. How can I help you find the perfect furniture today?', sender: 'ai' }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    // Add user message
    const userMsg = { id: Date.now().toString(), text: message, sender: 'user' as const };
    const newChat = [...chat, userMsg];
    setChat(newChat);
    setMessage('');
    setIsLoading(true);

    try {
      const apiKey = Constants?.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY || Constants?.manifest?.extra?.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key missing. Ensure EXPO_PUBLIC_GEMINI_API_KEY is defined in app.json extra.");
      }

      // Format history for Gemini API
      const contents = newChat
        .filter(msg => msg.id !== '1') // Skip the initial greeting if needed, or map it to model
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      // Ensure first message is from user (Gemini requirement if we skip greeting)
      if (contents.length > 0 && contents[0].role === 'model') {
          contents.shift();
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: "You are Casa AI, an expert furniture shopping assistant for the Casa E-Commerce application. You help users find furniture, suggest interior design styles, and answer questions about home decor. Keep your answers concise, friendly, and helpful." }]
          },
          contents: contents
        })
      });

      const data = await response.json();
      
      let aiText = "I'm sorry, I couldn't process that.";
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        aiText = data.candidates[0].content.parts[0].text;
      } else if (data.error) {
        aiText = `API Error: ${data.error.message}`;
      }

      setChat(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: aiText, 
        sender: 'ai' as const 
      }]);
    } catch (error: any) {
      setChat(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: error.message || "Network error. Please try again.", 
        sender: 'ai' as const 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubbles" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.chatBox}>
              
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitle}>
                  <Ionicons name="sparkles" size={20} color={COLORS.primary} />
                  <Text style={styles.headerText}>Casa AI Assistant</Text>
                </View>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Chat Area */}
              <ScrollView 
                style={styles.chatArea}
                contentContainerStyle={{ padding: 16 }}
              >
                {chat.map(msg => (
                  <View 
                    key={msg.id} 
                    style={[
                      styles.messageBubble, 
                      msg.sender === 'user' ? styles.userBubble : styles.aiBubble
                    ]}
                  >
                    <Text style={[
                      styles.messageText,
                      msg.sender === 'user' ? styles.userText : styles.aiText
                    ]}>
                      {msg.text}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              {/* Input Area */}
              <View style={styles.inputArea}>
                <TextInput
                  style={styles.input}
                  placeholder={isLoading ? "AI is thinking..." : "Ask me anything..."}
                  value={message}
                  onChangeText={setMessage}
                  onSubmitEditing={handleSend}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  style={[styles.sendButton, (!message.trim() || isLoading) && { opacity: 0.5 }]}
                  onPress={handleSend}
                  disabled={!message.trim() || isLoading}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 9999,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chatBox: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontFamily: THEME.typography.fontFamily.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  chatArea: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontFamily: THEME.typography.fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: COLORS.text,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: 16,
    fontFamily: THEME.typography.fontFamily.regular,
    fontSize: 15,
    marginRight: 12,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
