# Pizza Dash User Manual

This manual provides instructions on how to install, set up, and use the Pizza Dash mobile application. Pizza Dash is a location-based mobile game that integrates physical activity with virtual pizza delivery gameplay.

## Table of Contents

1. [Installation](#installation)
2. [Initial Setup](#initial-setup)
3. [Main Interface](#main-interface)
4. [Gameplay Instructions](#gameplay-instructions)
5. [Progression System](#progression-system)
6. [Settings & Customization](#settings--customization)
7. [Troubleshooting](#troubleshooting)

## Installation

### iOS Installation

1. **App Store Method (Preferred - When Available)**

   - Open the App Store on your iOS device
   - Search for "Pizza Dash"
   - Tap "Get" to download and install
   - The app requires iOS 14.0 or later

2. **Manual Installation (For Development Testing)**
   - Ensure you have Xcode 15+ installed on your Mac
   - Clone the repository from GitHub
   - Connect your iOS device to your Mac
   - Open the project in Xcode
   - Select your device as the build target
   - Click Run (or press Cmd+R)
   - Trust the developer profile on your device when prompted

## Initial Setup

When you first launch Pizza Dash, you'll need to:

1. **Grant Permissions**: Allow location and motion activity permissions when prompted. Both are required for core gameplay functionality.

## Main Interface

The app has five main screens accessible via the bottom tab navigation:

### Dashboard Screen

- Shows your current step count and fitness statistics
- Displays active delivery information
- Presents daily/weekly/monthly step visualizations
- Accessible by tapping the "Dashboard" icon on the tab bar

### Map Screen

- Shows your current location and nearby restaurants
- Displays navigation routes and distance information
- Allows you to initiate restaurant visits for pizza creation
- Accessible by tapping the "Map" icon on the tab bar

### Orders Screen

- Manage incoming delivery requests
- Track active deliveries in progress
- View history of past deliveries
- Accessible by tapping the "Order" icon on the tab bar

### Customize Screen

- Purchase and upgrade vehicles and characters
- View stats for your current equipment
- Manage your inventory of owned items
- Accessible by tapping the "Customize" icon on the tab bar

## Gameplay Instructions

Pizza Dash follows a simple delivery loop that encourages physical movement:

### 1. Accept an Order

- Go to the Orders screen
- Review available orders in the "Incoming" tab
- Each order shows:
  - Customer information
  - Delivery distance
  - Reward (currency + XP)
  - Items to deliver
- Tap "Accept" on an order you wish to take

### 2. Navigate to the Restaurant

- After accepting an order, go to the Map screen
- The map will show nearby restaurants within a 3km radius
- Tap on a restaurant to view its details
- Tap "Navigate" to get directions
- Physically walk to the restaurant location
- When within 500m of the restaurant, you'll be able to make the pizza

### 3. Make the Pizza

- Once near the restaurant, a "Make Pizza" notification will appear
- Tap on the restaurant marker on the map
- You'll enter the Pizza Making mini-game
- Add ingredients in sequence (sauce, cheese, toppings) by tapping each option
- Tap "Complete Pizza" when all ingredients have been added
- For orders with multiple pizzas, repeat the process for each one

### 4. Deliver to the Customer

- After making all pizzas, the order status updates to ready for delivery
- Use the Map screen to navigate to the customer's location
- Physically walk to the delivery location
- When within 300m of the customer, tap "Complete Order" to finish the delivery
- You'll receive currency and XP rewards

## Progression System

Pizza Dash features a dual progression system:

### Experience Points (XP)

- Earned by completing deliveries
- Amount based on order value and delivery distance
- Accumulate XP to level up (formula: level × 100 XP required per level)
- Higher levels unlock new equipment options

### Currency

- Earned from completed deliveries
- Amount based on order value and modified by equipment bonuses
- Used to purchase new vehicles and characters
- Also used for upgrades to improve equipment stats

### Equipment

#### Vehicles

- Determine order capacity and delivery range
- Three tiers available:
  - Basic Bike (starter): 1 order capacity, 1000m range
  - Delivery Scooter (level 2 unlock): 2 orders, 1500m range
  - Pizza Mobile (level 5 unlock): 3 orders, 2000m range
- Each vehicle can be upgraded three times

#### Characters

- Provide earning bonuses for completed deliveries
- Three tiers available:
  - Rookie Driver (starter): No bonus
  - Expert Driver (level 3 unlock): 10% earnings bonus
  - Pizza Master (level 6 unlock): 25% earnings bonus
- Each character can be upgraded three times

## Settings & Customization

Access the Settings screen by tapping the gear icon on the Dashboard screen.

### Audio Settings

- Music Volume: Adjust background music volume
- SFX Volume: Adjust sound effects volume
- Mute Toggle: Available on Dashboard screen

### Game Settings

- Max Customer Distance: Set the maximum range for customer locations (100m-10km)
- This setting allows you to customize the game to your desired activity level

## Troubleshooting

### Location Issues

- **Problem**: App shows incorrect location or doesn't update position
- **Solution**: Ensure location permissions are set to "Always" in your device settings
- **Solution**: Toggle location services off and on in your device settings
- **Solution**: Restart the application

### Step Counting Issues

- **Problem**: Step count doesn't update or seems inaccurate
- **Solution**: Ensure motion & fitness permissions are enabled in device settings
- **Solution**: Carry your device in a pocket or bag while walking for best accuracy
- **Solution**: Restart the application

### Order Acceptance Issues

- **Problem**: Can't accept more orders
- **Solution**: Check your vehicle's capacity limit in the Customize screen
- **Solution**: Complete current deliveries to free up capacity
- **Solution**: Upgrade your vehicle to increase capacity

### Mini-Game Access Issues

- **Problem**: Can't make pizza even when near restaurant
- **Solution**: Ensure you're within 500m of the restaurant
- **Solution**: Tap directly on the restaurant marker on the map
- **Solution**: Check for GPS signal issues in your current location

### Performance Issues

- **Problem**: App feels slow or unresponsive
- **Solution**: Close other applications running in the background
- **Solution**: Restart your device
- **Solution**: Ensure your iOS is updated to the latest version

---

For additional support or to report bugs, please contact support@pizzadash.example.com
