# Slotted

<img width="1891" height="906" alt="image" src="https://github.com/user-attachments/assets/d6a35dac-7d20-41c0-8029-82d0195b9f22" />


## What is this?

**Slotted** is a lightweight time management application that allows users to organize their schedule using flexible **time slots** within a custom date range.
Users can quickly create events by **dragging across the calendar grid** or by manually entering them through a side panel. The application focuses on fast planning, simple interaction, and visual clarity when managing time blocks. Events can be **created, edited, and deleted**, and are displayed both directly on the calendar and in a list view.

---

## Requirements
Before installing, make sure you have the following installed on your system:
- Node.js
- npm

---

## Installation
1. Clone or download the repository
2. Navigate to the project directory
3. Install dependencies
```
npm install
```
4. Start the development server:
```
npm run dev
```
5. Open your browser and navigate to:
> http://localhost:5173

--- 

## How to Create Events
### Drag & Select (Calendar)
Events can be created directly in the calendar:
Click and drag across time slots in the calendar.
Title your event.
The date, start and end time are set automatically based on the selected area and can optionally be adjusted.
Confirm the event.

### Manual Entry (Side Panel)
A panel on the left side of the application allows you to create events at any time without using drag selection.
Simply enter the event details and confirm to add the slot to the calendar.

## Event Management
Below the calendar, all created events are displayed in a list view.
From there you can:
- Edit events
- Delete events
- Review scheduled time slots
Changes are reflected immediately in the calendar.

## Event Interaction
Events inside the calendar are fully interactive and can be adjusted directly using drag and drop.

### Move Events
Events can be **dragged vertically within a day column** to change their scheduled time.  
Simply click and drag the event to a new position within the same day.

### Resize Events
The **start and end times** of an event can also be adjusted visually.
Each event has two draggable handles:
- **Top handle** – adjusts the start time
- **Bottom handle** – adjusts the end time

## Calendar Controls
The calendar includes several controls to customize the visible schedule:
- Date Range
- Time Range
- Start time
- End time
- Slot Interval Slider (available intervals: 15, 30 and 60 minutes)

## Notes
This project is intended for learning and prototyping purposes with React and is not intended as a production-ready scheduling system.
