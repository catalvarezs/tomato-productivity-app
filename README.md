# Tomato 🍅

**Tomato** is a minimalist, productivity dashboard designed to facilitate deep work sessions. It combines a customizable focus timer, a streamlined task manager, and an educational guide on productivity methods.

Built with **React 19**, **TypeScript**, and **Tailwind CSS**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.0-06B6D4?logo=tailwindcss&logoColor=white)

## Features

- **Advanced Timer Logic**: Supports multiple productivity techniques (Pomodoro, 52/17 Flow, 90/20 Ultradian) and custom durations.
- **Ambient Sound Engine**: Integrated white noise, nature sounds, and cafe ambience to boost focus.
- **Visual Feedback**: SVG-based circular progress indicators with dynamic glow effects and smooth transitions.
- **Task Management**: A friction-less to-do list with "Hero" input design and state persistence.
- **Methodology Guide**: Built-in educational resources explaining the science behind various focus techniques.
- **Privacy First**: Zero-dependency architecture. All state is persisted locally via the `Storage API` (localStorage), ensuring user data never leaves the device.
- **Responsive Design**: Mobile-first approach using Tailwind CSS utility classes with a unified "Apple-esque" aesthetic.

## Getting Started

This project is built using standard web technologies.

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tomato.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

## Design System

The application uses a semantic color system derived from the "Tomato" theme, specifically tuned to a deep, vibrant red:
- **Primary Accent**: `#d62828` (Action, Focus, Active States)
- **Surface**: `Slate-50` (Background) & `White` (Cards)
- **Typography**: `Inter` font family for clean readability.

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State Management**: React Hooks + LocalStorage
- **Audio**: Native HTML5 Audio API