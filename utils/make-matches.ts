import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// From a list of numbers, make pairings at random with each number appearing only once
// Example: [1, 2, 3, 4] -> [[1, 2], [3, 4]]
export function makePairs(numbers: number[]) {
  const shuffled = numbers.sort(() => Math.random() - 0.5);
  const pairs = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    pairs.push([shuffled[i], shuffled[i + 1]]);
  }
  console.log("utils.ts - pairs: ", pairs);
  return pairs;
}

// given the number of participants, return the level of the match bracket
// Example: 8 -> "quarter"
// Limit: 32 -> "round of 32"
export function getMatchLevel(participants: number) {
  if (participants < 2) {
    return "invalid";
  } else if (participants === 2) {
    return "final";
  } else if (participants <= 4) {
    return "semi";
  } else if (participants <= 8) {
    return "quarter";
  } else if (participants <= 16) {
    return "round of 16";
  } else if (participants <= 32) {
    return "round of 32";
  }
  return "invalid";
}
