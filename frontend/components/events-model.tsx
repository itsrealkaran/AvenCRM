import React from 'react'


interface Props {
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    location?: string;
    participants?: string[];
    color?: string;
}

function EventModel({title, description}: Props) {
  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}

export default EventModel
