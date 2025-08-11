// usePomodoro custom hook
import { useState } from 'react';

export const usePomodoro = () => {
  const [time] = useState(1500); // 25 min
  const [isActive] = useState(false);

  // Add start, pause, reset, and stats logic here
  return { time, isActive };
};
