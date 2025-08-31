'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { MessageSquare, Bot, User, TrendingUp, Clock, DollarSign, Search, Download, Calendar, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ChatSession {
  sessionId: string;
  organizationId: string;
  organizationName: string;
  userId: string;
  messageCount: number;
  totalTokens: number;
  estimatedCost: number;
  firstMessage: Date;
  lastMessage: Date;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  tokenCount: number;
  createdAt: string;
}

interface ChatStats {
  totalSessions: number;
  totalMessages: number;
  totalTokens: number;
  estimatedCost: number;
  avgMessagesPerSession: number;
  avgTokensPerMessage: number;
  topQuestions: { question: string; count: number }[];
  hourlyActivity: { hour: number; count: number }[];
}

export default function AIchatDashboard() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('7d');
  const [organizationFilter, setOrganizationFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [dateFilter, organizationFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/ai-chat?dateFilter=${dateFilter}&organizationFilter=${organizationFilter}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
        setStats(data.stats);
      } else {
        toast.error('Failed to fetch chat data');
      }
    } catch (error) {
      console.error('Error fetching chat data:', error);
      toast.error('Failed to fetch chat data');
    } finally {
      setLoading(false);
    }
  };

  const exportChatLogs = async () => {
    try {
      const response = await fetch('/api/admin/ai-chat/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateFilter, organizationFilter }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Chat logs exported successfully');
      }
    } catch (error) {
      toast.error('Failed to export chat logs');
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (!searchQuery) return true;
    return session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(cost);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Chat Analytics</h1>
        <p className="text-gray-600">Monitor conversations, usage, and performance</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
              <p className="text-xs text-gray-500 mt-1">
                ~{stats.avgMessagesPerSession} per session
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">
                ~{stats.avgTokensPerMessage} per message
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCost(stats.estimatedCost)}</div>
              <p className="text-xs text-gray-500 mt-1">GPT-4 pricing</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <Label htmlFor="date-filter">Date Range</Label>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger id="date-filter" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="search">Search Messages</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              type="text"
              placeholder="Search in conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-end">
          <Button onClick={exportChatLogs} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      <Tabs defaultValue="conversations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Click to view conversation details</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {filteredSessions.map((session) => (
                      <button
                        key={session.sessionId}
                        onClick={() => setSelectedSession(session)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          selectedSession?.sessionId === session.sessionId
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {session.organizationName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(session.firstMessage), 'MMM d, h:mm a')}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {session.messageCount} messages
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.round(
                              (new Date(session.lastMessage).getTime() - 
                               new Date(session.firstMessage).getTime()) / 60000
                            )} min
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatCost(session.estimatedCost)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Conversation Detail */}
            <Card>
              <CardHeader>
                <CardTitle>Conversation Detail</CardTitle>
                {selectedSession && (
                  <CardDescription>
                    Session ID: {selectedSession.sessionId}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {selectedSession ? (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {selectedSession.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`flex items-start gap-3 max-w-[80%] ${
                              message.role === 'user' ? 'flex-row-reverse' : ''
                            }`}
                          >
                            <div
                              className={`p-2 rounded-full ${
                                message.role === 'user' ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              {message.role === 'user' ? (
                                <User className="w-4 h-4 text-white" />
                              ) : (
                                <Bot className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <div className="flex gap-3 mt-2 text-xs opacity-70">
                                <span>
                                  {format(new Date(message.createdAt), 'h:mm a')}
                                </span>
                                <span>{message.tokenCount} tokens</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-[600px] text-gray-500">
                    Select a session to view the conversation
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {stats && (
            <>
              {/* Top Questions */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Asked Questions</CardTitle>
                  <CardDescription>Common topics users ask about</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topQuestions.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <p className="text-sm text-gray-700">{item.question}</p>
                        <Badge>{item.count} times</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Heatmap */}
              <Card>
                <CardHeader>
                  <CardTitle>Chat Activity by Hour</CardTitle>
                  <CardDescription>When users engage with the chatbot</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-1 h-40">
                    {stats.hourlyActivity.map((item) => (
                      <div
                        key={item.hour}
                        className="flex-1 bg-blue-600 rounded-t"
                        style={{
                          height: `${(item.count / Math.max(...stats.hourlyActivity.map(h => h.count))) * 100}%`,
                        }}
                        title={`${item.hour}:00 - ${item.count} messages`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>12 AM</span>
                    <span>6 AM</span>
                    <span>12 PM</span>
                    <span>6 PM</span>
                    <span>11 PM</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Performance Metrics</CardTitle>
              <CardDescription>Monitor response quality and efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">2.3s</p>
                  <p className="text-sm text-gray-500">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">94%</p>
                  <p className="text-sm text-gray-500">Resolution Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">4.8</p>
                  <p className="text-sm text-gray-500">Satisfaction Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Optimization</CardTitle>
              <CardDescription>Tips to reduce AI usage costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-medium text-amber-900">High Token Usage Detected</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Consider implementing response caching for frequently asked questions
                  </p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-900">Optimization Opportunity</p>
                  <p className="text-sm text-green-700 mt-1">
                    Enable conversation summarization to reduce context size
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}