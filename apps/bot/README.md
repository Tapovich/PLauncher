# LaunchKit AI - Telegram Bot

Telegram bot for LaunchKit AI using aiogram.

## Setup

1. Create virtual environment:
```bash
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy env.example to .env and configure:
```bash
cp env.example .env
```

4. Add your Telegram Bot Token (get from [@BotFather](https://t.me/botfather))

5. Run the bot:
```bash
python main.py
```

## Commands

- `/start` - Start the bot and open mini app
- `/help` - Show help message
- `/about` - About LaunchKit AI

## Features

- Telegram Mini App integration
- Command handlers
- Inline keyboard buttons
- WebApp support

