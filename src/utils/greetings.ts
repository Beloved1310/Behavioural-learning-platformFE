export interface TimeBasedGreeting {
  greeting: string;
  message: string;
  emoji: string;
}

export const getTimeBasedGreeting = (): TimeBasedGreeting => {
  const hour = new Date().getHours();

  // Early morning: 5 AM - 11:59 AM
  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Good morning',
      message: "Rise and shine, superstar! Let's make today amazing with some fun learning! 🌅",
      emoji: '☀️',
    };
  }

  // Afternoon: 12 PM - 4:59 PM
  if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Good afternoon',
      message: "Perfect time for a learning adventure! You're doing great today! 🌟",
      emoji: '🌤️',
    };
  }

  // Evening: 5 PM - 8:59 PM
  if (hour >= 17 && hour < 21) {
    return {
      greeting: 'Good evening',
      message: "Evening adventures are the best! Let's boost that brainpower! 🚀",
      emoji: '🌆',
    };
  }

  // Night: 9 PM - 4:59 AM (Night owls!)
  return {
    greeting: 'Hello, night owl',
    message: "Wow! You love learning so much, you're here late! Let's make it count! 🦉",
    emoji: '🌙',
  };
};
