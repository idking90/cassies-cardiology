export type Topic = {
  id: string
  name: string
  description: string
  question: string
  choices: string[]
  responseCounts: number[]
  teaching: {
    title: string
    summary: string
    discussionPoints: string[]
    facilitatorNote: string
    reference: string
  }
}

export const topics: Topic[] = [
  {
    id: 'rhythm-review', name: 'Rhythm review', description: 'Reading a basic rhythm strip',
    question: 'Which finding would you discuss first when reviewing this rhythm strip?',
    choices: ['Rate and regularity', 'P-wave morphology', 'QRS duration', 'ST-segment contour'], responseCounts: [0, 0, 0, 0],
    teaching: { title: 'Rhythm review', summary: 'A brief facilitator guide for a structured rhythm-strip discussion.', discussionPoints: ['Start with a consistent approach before interpreting the tracing.', 'Invite learners to describe their observations before naming a rhythm.', 'Connect the rhythm pattern to the next clinical question.'], facilitatorNote: 'Pause for group discussion and adapt the depth to the learners in the room.', reference: 'Local teaching resource' },
  },
  {
    id: 'murmur-basics', name: 'Murmur basics', description: 'Describing a cardiac murmur',
    question: 'Which feature is most useful to describe before discussing this murmur?',
    choices: ['Timing', 'Radiation', 'Location', 'Response to a maneuver'], responseCounts: [0, 0, 0, 0],
    teaching: { title: 'Murmur basics', summary: 'A facilitator guide for building a shared vocabulary around cardiac murmurs.', discussionPoints: ['Use timing, location, quality, and radiation as a repeatable framework.', 'Ask the group which bedside maneuver might add information.', 'Relate the exam finding to a clinical scenario.'], facilitatorNote: 'Invite one learner to summarize the group’s shared approach before moving on.', reference: 'Local teaching resource' },
  },
  {
    id: 'chest-pain', name: 'Chest pain approach', description: 'Structuring an initial assessment',
    question: 'What would be the most helpful next discussion point in this chest pain case?',
    choices: ['Symptom timeline', 'Risk factors', 'Initial testing', 'Disposition planning'], responseCounts: [0, 0, 0, 0],
    teaching: { title: 'Chest pain approach', summary: 'A facilitator guide for a structured discussion of an initial chest pain presentation.', discussionPoints: ['Begin with the highest-priority clinical concerns.', 'Ask learners what additional context would change their thinking.', 'Close by reviewing a simple, repeatable framework.'], facilitatorNote: 'Use a brief think-pair-share before opening the discussion to the group.', reference: 'Local teaching resource' },
  },
  {
    id: 'heart-failure', name: 'Heart failure foundations', description: 'Recognizing a heart failure presentation',
    question: 'Which element of this presentation would you explore next with the group?',
    choices: ['Symptoms', 'Volume status', 'Medication history', 'Follow-up plan'], responseCounts: [0, 0, 0, 0],
    teaching: { title: 'Heart failure foundations', summary: 'A facilitator guide for discussing a heart failure presentation.', discussionPoints: ['Distinguish symptoms, signs, and supporting data.', 'Discuss how volume status informs the next step.', 'Ask learners to name a safe follow-up question.'], facilitatorNote: 'Finish by asking learners to apply the framework to a new case.', reference: 'Local teaching resource' },
  },
]

export function getTopic(topicId: string) { return topics.find((topic) => topic.id === topicId) }
