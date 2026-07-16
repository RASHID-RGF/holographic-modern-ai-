export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  code?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  size: string;
  preview?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export interface SystemStats {
  cpu: number;
  ram: number;
  gpu: number;
  ramTotal: number;
  ramUsed: number;
  network: { download: number; upload: number };
  uptime: number;
  processes: number;
}

export interface Weather {
  city: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  icon: string;
  condition: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  date: Date | string;
  type: 'meeting' | 'reminder' | 'task' | 'event';
  color?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'social';
  read: boolean;
  icon?: string;
}

export interface SmartDevice {
  id: string;
  name: string;
  type: 'light' | 'thermostat' | 'lock' | 'camera' | 'speaker' | 'plug';
  status: 'on' | 'off' | 'locked' | 'unlocked' | 'idle';
  value?: number;
  room: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
  url?: string;
}

export interface CodeSnippet {
  id: string;
  language: string;
  code: string;
  description: string;
  timestamp: number;
}

export type WidgetType =
  | 'weather'
  | 'calendar'
  | 'notifications'
  | 'smart-home'
  | 'analytics'
  | 'news'
  | 'code-assistant'
  | 'music';
