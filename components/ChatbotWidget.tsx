'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

// Predefined responses for common questions
const botResponses: { [key: string]: string } = {
  'pricing': 'Our pricing starts at $80 for regular cleaning, $150 for deep cleaning, and $200 for move-in/move-out cleaning. We also offer subscription packages: Starter ($29.99/mo), Growth ($59.99/mo), and Premium ($99.99/mo) for businesses.',
  'services': 'We offer: Regular Cleaning (weekly/bi-weekly/monthly), Deep Cleaning, Move-in/Move-out Cleaning, Office Cleaning, and Post-construction Cleaning. All services include eco-friendly products and satisfaction guarantee!',
  'booking': 'Booking is easy! You can book online through our website, call us at (555) 100-1000, or use our mobile app. We usually have availability within 24-48 hours.',
  'areas': 'We currently serve San Francisco, Oakland, San Jose, and surrounding Bay Area cities. Check our service area map on the website for specific neighborhoods.',
  'guarantee': 'We offer a 100% satisfaction guarantee! If you&apos;re not happy with our service, we&apos;ll come back and re-clean for free within 24 hours.',
  'supplies': 'We bring all necessary cleaning supplies and equipment! We use eco-friendly, non-toxic products. If you have specific product preferences, just let us know.',
  'duration': 'Cleaning duration depends on the size and condition: Studio/1BR: 1-2 hours, 2BR: 2-3 hours, 3BR+: 3-4 hours. Deep cleaning takes about 50% longer.',
  'payment': 'We accept all major credit cards, debit cards, ACH bank transfers, and digital wallets (Apple Pay, Google Pay). Payment is due after service completion.',
  'cancellation': 'You can cancel or reschedule up to 24 hours before your appointment without any fees. Cancellations within 24 hours may incur a 50% charge.',
  'insurance': 'Yes! All our technicians are fully insured and bonded. We carry $2 million in general liability insurance and workers&apos; compensation.',
  'eco': 'We use eco-friendly, biodegradable cleaning products that are safe for children and pets. All our products are Green Seal certified.',
  'staff': 'Our technicians are carefully vetted with background checks, fully trained, insured, and have an average of 3+ years experience. Many have been with us for over 5 years!',
  'frequency': 'We recommend weekly or bi-weekly cleaning for most homes. Monthly cleaning works well for smaller spaces or less busy households.',
  'pets': 'We love pets! Our technicians are pet-friendly and use pet-safe products. Please let us know about your pets when booking.',
  'tips': 'Tipping is appreciated but not required. The industry standard is 15-20% for exceptional service, but it&apos;s entirely at your discretion.',
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hi! I&apos;m CleanBot, your virtual cleaning assistant. How can I help you today? You can ask me about pricing, services, booking, or anything else!',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findBestResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Check for keywords in the input
    for (const [key, response] of Object.entries(botResponses)) {
      if (lowerInput.includes(key) || 
          (key === 'pricing' && (lowerInput.includes('price') || lowerInput.includes('cost') || lowerInput.includes('how much'))) ||
          (key === 'services' && (lowerInput.includes('service') || lowerInput.includes('offer') || lowerInput.includes('what do you'))) ||
          (key === 'booking' && (lowerInput.includes('book') || lowerInput.includes('schedule') || lowerInput.includes('appointment'))) ||
          (key === 'areas' && (lowerInput.includes('area') || lowerInput.includes('location') || lowerInput.includes('where'))) ||
          (key === 'guarantee' && (lowerInput.includes('guarantee') || lowerInput.includes('satisfied') || lowerInput.includes('happy'))) ||
          (key === 'supplies' && (lowerInput.includes('supplies') || lowerInput.includes('products') || lowerInput.includes('bring'))) ||
          (key === 'duration' && (lowerInput.includes('how long') || lowerInput.includes('duration') || lowerInput.includes('time'))) ||
          (key === 'payment' && (lowerInput.includes('pay') || lowerInput.includes('credit') || lowerInput.includes('card'))) ||
          (key === 'cancellation' && (lowerInput.includes('cancel') || lowerInput.includes('reschedule'))) ||
          (key === 'insurance' && (lowerInput.includes('insur') || lowerInput.includes('bond'))) ||
          (key === 'eco' && (lowerInput.includes('eco') || lowerInput.includes('green') || lowerInput.includes('safe') || lowerInput.includes('toxic'))) ||
          (key === 'staff' && (lowerInput.includes('technician') || lowerInput.includes('staff') || lowerInput.includes('employee') || lowerInput.includes('background'))) ||
          (key === 'frequency' && (lowerInput.includes('often') || lowerInput.includes('frequency') || lowerInput.includes('regular'))) ||
          (key === 'pets' && (lowerInput.includes('pet') || lowerInput.includes('dog') || lowerInput.includes('cat') || lowerInput.includes('animal'))) ||
          (key === 'tips' && (lowerInput.includes('tip') || lowerInput.includes('gratuity')))) {
        return response;
      }
    }
    
    // Default responses for common greetings and unknown queries
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return 'Hello! How can I help you with your cleaning needs today?';
    }
    
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return 'You&apos;re welcome! Is there anything else I can help you with?';
    }
    
    if (lowerInput.includes('bye') || lowerInput.includes('goodbye')) {
      return 'Thank you for chatting with us! Have a sparkling clean day! ✨';
    }
    
    // Default response for unrecognized queries
    return 'I&apos;m not sure about that specific question, but I can help you with information about our services, pricing, booking, service areas, and more. You can also call us at (555) 100-1000 for personalized assistance!';
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot typing and response
    setTimeout(() => {
      const botResponse = findBestResponse(inputValue);
      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    'What are your prices?',
    'What services do you offer?',
    'How do I book?',
    'What areas do you serve?',
  ];

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all duration-300 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Widget */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl transition-all duration-300 flex flex-col ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold">CleanBot Assistant</h3>
              <p className="text-xs opacity-90">Always here to help!</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <Bot size={16} className="text-gray-600" />
                  )}
                </div>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-gray-200">
                  <Bot size={16} className="text-gray-600" />
                </div>
                <div className="px-4 py-2 rounded-lg bg-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
            <div className="space-y-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputValue(question);
                    handleSendMessage();
                  }}
                  className="text-left text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg w-full transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <button
              onClick={handleSendMessage}
              disabled={inputValue.trim() === ''}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}