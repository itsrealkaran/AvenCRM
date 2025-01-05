export interface EventColor {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
}

export const eventColors: EventColor[] = [
  {
    id: 'blue',
    name: 'Blue',
    backgroundColor: '#3182ce',
    textColor: 'white',
  },
  {
    id: 'green',
    name: 'Green',
    backgroundColor: '#34A853',
    textColor: 'white',
  },
  {
    id: 'red',
    name: 'Red',
    backgroundColor: '#E53E3E',
    textColor: 'white',
  },
  {
    id: 'purple',
    name: 'Purple',
    backgroundColor: '#805AD5',
    textColor: 'white',
  },
  {
    id: 'orange',
    name: 'Orange',
    backgroundColor: '#ED8936',
    textColor: 'white',
  },
];

export const getEventStyle = (event: any) => {
  // For Google Calendar events, keep the original green color
  if (event.source === 'google') {
    return {
      backgroundColor: '#34A853',
      textColor: 'white',
    };
  }

  // For custom events, use the selected color or default to blue
  const color = event.color ? eventColors.find(c => c.id === event.color) : eventColors[0];
  //@ts-ignore
  return { backgroundColor: color.backgroundColor, textColor: color.textColor };
};
