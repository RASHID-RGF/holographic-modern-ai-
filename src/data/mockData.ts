import { SystemStats, Weather, CalendarEvent, Notification, SmartDevice, NewsItem, Message } from '@/types';

export const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: '👋 Welcome to **Nova AI OS**. I\'m your intelligent assistant. How can I help you today?',
    timestamp: Date.now() - 60000,
  },
  {
    id: '2',
    role: 'user',
    content: 'Show me the system analytics dashboard',
    timestamp: Date.now() - 30000,
  },
  {
    id: '3',
    role: 'assistant',
    content: 'Sure! Opening the analytics panel now. Your system is running optimally with 8.4GB RAM available and CPU at 23%.',
    timestamp: Date.now() - 15000,
  },
];

export const systemStats: SystemStats = {
  cpu: 23,
  ram: 45,
  gpu: 34,
  ramTotal: 16,
  ramUsed: 7.2,
  network: { download: 45.2, upload: 12.8 },
  uptime: 86400 * 3 + 3600 * 14 + 120,
  processes: 187,
};

export const weather: Weather = {
  city: 'San Francisco',
  temperature: 22,
  feelsLike: 20,
  condition: 'Partly Cloudy',
  icon: 'partly-cloudy',
  humidity: 65,
  windSpeed: 12,
  forecast: [
    { day: 'Mon', high: 24, low: 16, icon: 'sunny', condition: 'Sunny' },
    { day: 'Tue', high: 22, low: 15, icon: 'partly-cloudy', condition: 'Cloudy' },
    { day: 'Wed', high: 19, low: 13, icon: 'rainy', condition: 'Light Rain' },
    { day: 'Thu', high: 21, low: 14, icon: 'partly-cloudy', condition: 'Partly Cloudy' },
    { day: 'Fri', high: 25, low: 17, icon: 'sunny', condition: 'Clear' },
  ],
};

export const calendarEvents: CalendarEvent[] = [
  { id: '1', title: 'Team Standup', time: '09:00', duration: '30m', date: new Date(), type: 'meeting', color: '#00e5ff' },
  { id: '2', title: 'Design Review', time: '11:30', duration: '1h', date: new Date(), type: 'meeting', color: '#7c4dff' },
  { id: '3', title: 'Lunch with Sarah', time: '13:00', duration: '45m', date: new Date(), type: 'event', color: '#ff4081' },
  { id: '4', title: 'Update Documentation', time: '15:00', duration: '2h', date: new Date(), type: 'task', color: '#00e676' },
  { id: '5', title: 'AI Training Session', time: '10:00', duration: '1.5h', date: new Date(Date.now() + 86400000), type: 'event', color: '#ffd740' },
];

export const notifications: Notification[] = [
  { id: '1', title: 'System Update Available', message: 'Nova AI v2.4.1 is ready to install.', time: '2m ago', type: 'info', read: false },
  { id: '2', title: 'Voice Command Detected', message: 'Successfully processed voice command.', time: '15m ago', type: 'success', read: false },
  { id: '3', title: 'Security Alert', message: 'New login from Chrome, San Francisco.', time: '1h ago', type: 'warning', read: false },
  { id: '4', title: 'Backup Complete', message: 'System backup completed successfully.', time: '2h ago', type: 'success', read: true },
  { id: '5', title: 'Memory Usage High', message: 'RAM usage exceeded 85% threshold.', time: '3h ago', type: 'error', read: true },
  { id: '6', title: 'New Feature: AR Mode', message: 'Augmented Reality mode is now available.', time: '5h ago', type: 'info', read: true },
  { id: '7', title: 'Sarah liked your post', message: 'Your dashboard design was liked by Sarah.', time: '6h ago', type: 'social', read: true },
];

export const smartDevices: SmartDevice[] = [
  { id: '1', name: 'Living Room Light', type: 'light', status: 'on', room: 'Living Room' },
  { id: '2', name: 'Kitchen Light', type: 'light', status: 'off', room: 'Kitchen' },
  { id: '3', name: 'Thermostat', type: 'thermostat', status: 'on', value: 22, room: 'Living Room' },
  { id: '4', name: 'Front Door Lock', type: 'lock', status: 'locked', room: 'Entrance' },
  { id: '5', name: 'Bedroom Speaker', type: 'speaker', status: 'idle', room: 'Bedroom' },
  { id: '6', name: 'Garden Camera', type: 'camera', status: 'on', room: 'Garden' },
];

export const newsFeed: NewsItem[] = [
  { id: '1', title: 'Nova AI Achieves Breakthrough in Real-time Translation', source: 'TechCrunch', time: '2h ago', category: 'Technology' },
  { id: '2', title: 'Quantum Computing Milestone Reached by Nova Labs', source: 'Wired', time: '4h ago', category: 'Science' },
  { id: '3', title: 'Global Markets Rally on AI Innovation News', source: 'Bloomberg', time: '6h ago', category: 'Finance' },
  { id: '4', title: 'New AR Glasses Integrate Nova OS Natively', source: 'The Verge', time: '8h ago', category: 'Technology' },
  { id: '5', title: 'Nova Smart Home Platform Expands to 50 Countries', source: 'Reuters', time: '10h ago', category: 'Business' },
];

export const codeSnippets = [
  {
    language: 'TypeScript',
    code: `function fibonacci(n: number): number {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}`,
    description: 'Optimized Fibonacci implementation'
  },
  {
    language: 'Python',
    code: `async def process_data(items):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_item(session, item) for item in items]
        results = await asyncio.gather(*tasks)
        return [r for r in results if r is not None]`,
    description: 'Async data processing pipeline'
  },
];
