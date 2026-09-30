import React from 'react';
import {
  Home,
  Zap,
  ShoppingBag,
  Car,
  HeartPulse,
  Utensils,
  Film,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Plane,
  Users,
  Briefcase,
  Coffee,
  PiggyBank,
  Smartphone,
  BookOpen,
  Wifi,
  HelpCircle,
} from 'lucide-react';

export function getPacketIcon(iconName: string, className = 'w-5 h-5') {
  switch (iconName?.toLowerCase()) {
    case 'home':
      return <Home className={className} />;
    case 'zap':
      return <Zap className={className} />;
    case 'shoppingbag':
    case 'groceries':
      return <ShoppingBag className={className} />;
    case 'car':
    case 'transit':
      return <Car className={className} />;
    case 'heartpulse':
    case 'health':
      return <HeartPulse className={className} />;
    case 'utensils':
    case 'dining':
      return <Utensils className={className} />;
    case 'film':
    case 'entertainment':
      return <Film className={className} />;
    case 'sparkles':
    case 'fun':
      return <Sparkles className={className} />;
    case 'shieldcheck':
    case 'emergency':
    case 'shield':
      return <ShieldCheck className={className} />;
    case 'trendingup':
    case 'investment':
    case 'investing':
      return <TrendingUp className={className} />;
    case 'creditcard':
    case 'debt':
      return <CreditCard className={className} />;
    case 'plane':
    case 'travel':
      return <Plane className={className} />;
    case 'users':
    case 'family':
      return <Users className={className} />;
    case 'briefcase':
    case 'work':
      return <Briefcase className={className} />;
    case 'coffee':
      return <Coffee className={className} />;
    case 'piggybank':
      return <PiggyBank className={className} />;
    case 'smartphone':
      return <Smartphone className={className} />;
    case 'bookopen':
      return <BookOpen className={className} />;
    case 'wifi':
      return <Wifi className={className} />;
    default:
      return <PiggyBank className={className} />;
  }
}
